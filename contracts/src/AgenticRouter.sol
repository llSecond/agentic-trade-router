// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IUniversalRouter, IPoolManager, IPermit2, IERC20, IWETH} from "./interfaces/IUniversalRouter.sol";

/**
 * @title AgenticRouter
 * @notice Routes swaps on Uniswap v4 based on user preferences read from ENS text records
 * @dev Preferences are read off-chain and passed as parameters to save gas
 */
contract AgenticRouter {
    // ============ Events ============

    event SwapExecuted(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint24 feeTier,
        uint256 slippageBps
    );

    // ============ Errors ============

    error InvalidSlippage();
    error InvalidFeeTier();
    error InvalidMaxHops();
    error SwapFailed();
    error InsufficientOutput();
    error DeadlineExpired();
    error ZeroAmount();
    error InvalidTokenAddress();
    error TransferFailed();

    // ============ Structs ============

    /// @notice Swap preferences derived from ENS text records
    struct SwapPreferences {
        uint24 feeTier; // Uniswap fee tier (100, 500, 3000, 10000)
        uint256 slippageBps; // Slippage in basis points (50 = 0.5%)
        uint256 deadline; // Transaction deadline timestamp
        uint8 maxHops; // Maximum routing hops (1-3)
    }

    // ============ Constants ============

    // Universal Router commands
    uint8 constant V4_SWAP = 0x10;
    uint8 constant PERMIT2_TRANSFER_FROM = 0x02;
    uint8 constant SWEEP = 0x04;
    uint8 constant UNWRAP_WETH = 0x0c;
    uint8 constant WRAP_ETH = 0x0b;

    // Tick spacing by fee tier
    int24 constant TICK_SPACING_100 = 1;
    int24 constant TICK_SPACING_500 = 10;
    int24 constant TICK_SPACING_3000 = 60;
    int24 constant TICK_SPACING_10000 = 200;

    // ============ Immutables ============

    /// @notice Uniswap v4 Universal Router address
    IUniversalRouter public immutable universalRouter;

    /// @notice Uniswap v4 Pool Manager address
    IPoolManager public immutable poolManager;

    /// @notice Permit2 contract address
    IPermit2 public immutable permit2;

    /// @notice WETH address
    IWETH public immutable weth;

    // ============ Constructor ============

    /**
     * @param _universalRouter Universal Router address
     * @param _poolManager Pool Manager address
     * @param _permit2 Permit2 address
     * @param _weth WETH address
     */
    constructor(address _universalRouter, address _poolManager, address _permit2, address _weth) {
        universalRouter = IUniversalRouter(_universalRouter);
        poolManager = IPoolManager(_poolManager);
        permit2 = IPermit2(_permit2);
        weth = IWETH(_weth);
    }

    // ============ External Functions ============

    /**
     * @notice Execute a swap with user preferences
     * @param tokenIn Input token address (address(0) for ETH)
     * @param tokenOut Output token address (address(0) for ETH)
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output tokens (calculated from slippage)
     * @param preferences User's trading preferences from ENS
     * @return amountOut Actual output amount
     */
    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        SwapPreferences calldata preferences
    ) external payable returns (uint256 amountOut) {
        // Validate inputs
        if (amountIn == 0) revert ZeroAmount();
        if (tokenIn == tokenOut) revert InvalidTokenAddress();

        // Validate preferences
        _validatePreferences(preferences);

        // Check deadline
        if (block.timestamp > preferences.deadline) {
            revert DeadlineExpired();
        }

        // Handle ETH input
        bool isETHIn = tokenIn == address(0);
        bool isETHOut = tokenOut == address(0);

        address actualTokenIn = isETHIn ? address(weth) : tokenIn;
        address actualTokenOut = isETHOut ? address(weth) : tokenOut;

        // Transfer tokens from user (or wrap ETH)
        if (isETHIn) {
            require(msg.value == amountIn, "Incorrect ETH amount");
            weth.deposit{value: amountIn}();
            weth.approve(address(permit2), amountIn);
        } else {
            // Transfer tokens from user to this contract
            bool success = IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
            if (!success) revert TransferFailed();

            // Approve Permit2
            IERC20(tokenIn).approve(address(permit2), amountIn);
        }

        // Approve Universal Router via Permit2
        permit2.approve(actualTokenIn, address(universalRouter), uint160(amountIn), uint48(block.timestamp + 3600));

        // Build and execute the swap
        uint256 balanceBefore = isETHOut ? address(this).balance : IERC20(actualTokenOut).balanceOf(address(this));

        _executeV4Swap(actualTokenIn, actualTokenOut, amountIn, minAmountOut, preferences);

        uint256 balanceAfter = isETHOut ? address(this).balance : IERC20(actualTokenOut).balanceOf(address(this));

        amountOut = balanceAfter - balanceBefore;

        // Check slippage
        if (amountOut < minAmountOut) {
            revert InsufficientOutput();
        }

        // Transfer output to user
        if (isETHOut) {
            weth.withdraw(IERC20(address(weth)).balanceOf(address(this)));
            (bool sent,) = msg.sender.call{value: amountOut}("");
            if (!sent) revert TransferFailed();
        } else {
            bool success = IERC20(actualTokenOut).transfer(msg.sender, amountOut);
            if (!success) revert TransferFailed();
        }

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, preferences.feeTier, preferences.slippageBps);

        return amountOut;
    }

    /**
     * @notice Calculate minimum output based on expected output and slippage
     * @param expectedOutput Expected output amount from quote
     * @param slippageBps Slippage tolerance in basis points
     * @return minOutput Minimum acceptable output
     */
    function calculateMinOutput(uint256 expectedOutput, uint256 slippageBps) public pure returns (uint256 minOutput) {
        if (slippageBps > 10000) revert InvalidSlippage();
        minOutput = (expectedOutput * (10000 - slippageBps)) / 10000;
    }

    /**
     * @notice Get tick spacing for a fee tier
     * @param feeTier The fee tier in hundredths of a bip
     * @return tickSpacing The tick spacing for that fee tier
     */
    function getTickSpacing(uint24 feeTier) public pure returns (int24 tickSpacing) {
        if (feeTier == 100) return TICK_SPACING_100;
        if (feeTier == 500) return TICK_SPACING_500;
        if (feeTier == 3000) return TICK_SPACING_3000;
        if (feeTier == 10000) return TICK_SPACING_10000;
        revert InvalidFeeTier();
    }

    // ============ Internal Functions ============

    /**
     * @notice Execute swap via Universal Router
     */
    function _executeV4Swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        SwapPreferences calldata preferences
    ) internal {
        // Sort tokens for pool key
        (address currency0, address currency1, bool zeroForOne) = _sortTokens(tokenIn, tokenOut);

        // Build pool key
        IPoolManager.PoolKey memory poolKey = IPoolManager.PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: preferences.feeTier,
            tickSpacing: getTickSpacing(preferences.feeTier),
            hooks: address(0) // No hooks for basic swap
        });

        // Build swap params
        // zeroForOne: true if swapping token0 for token1
        // amountSpecified: positive for exact input, negative for exact output
        IPoolManager.SwapParams memory swapParams = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: int256(amountIn), // Exact input
            sqrtPriceLimitX96: zeroForOne ? 4295128740 : 1461446703485210103287273052203988822378723970341 // Min/max sqrt price
        });

        // Encode the V4_SWAP command
        bytes memory v4SwapData = abi.encode(poolKey, swapParams, minAmountOut, bytes(""));

        // Build commands and inputs arrays
        bytes memory commands = abi.encodePacked(V4_SWAP);
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = v4SwapData;

        // Execute via Universal Router
        universalRouter.execute(commands, inputs, preferences.deadline);
    }

    /**
     * @notice Sort tokens and determine swap direction
     */
    function _sortTokens(address tokenA, address tokenB)
        internal
        pure
        returns (address currency0, address currency1, bool zeroForOne)
    {
        if (tokenA < tokenB) {
            currency0 = tokenA;
            currency1 = tokenB;
            zeroForOne = true;
        } else {
            currency0 = tokenB;
            currency1 = tokenA;
            zeroForOne = false;
        }
    }

    /**
     * @notice Validate swap preferences
     */
    function _validatePreferences(SwapPreferences calldata prefs) internal pure {
        // Validate fee tier
        if (prefs.feeTier != 100 && prefs.feeTier != 500 && prefs.feeTier != 3000 && prefs.feeTier != 10000) {
            revert InvalidFeeTier();
        }

        // Validate slippage (max 10% = 1000 bps)
        if (prefs.slippageBps > 1000) {
            revert InvalidSlippage();
        }

        // Max hops between 1-3
        if (prefs.maxHops < 1 || prefs.maxHops > 3) {
            revert InvalidMaxHops();
        }
    }

    // ============ Receive ETH ============

    receive() external payable {}
}
