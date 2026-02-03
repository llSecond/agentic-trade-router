// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgenticRouter.sol";

contract AgenticRouterTest is Test {
    AgenticRouter public router;

    // Sepolia addresses
    address constant UNIVERSAL_ROUTER = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9; // Sepolia WETH

    address user = makeAddr("user");

    function setUp() public {
        router = new AgenticRouter(UNIVERSAL_ROUTER, POOL_MANAGER, PERMIT2, WETH);
    }

    // ============ Validation Tests ============

    function testValidatePreferences_ValidParams() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 2
        });

        // Should not revert
        router.calculateMinOutput(1000, prefs.slippageBps);
    }

    function testValidatePreferences_InvalidFeeTier() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 2000, // Invalid fee tier
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 2
        });

        vm.expectRevert(AgenticRouter.InvalidFeeTier.selector);
        router.executeSwap(WETH, address(1), 1 ether, 0.9 ether, prefs);
    }

    function testValidatePreferences_InvalidSlippage() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 1500, // > 10% slippage
            deadline: block.timestamp + 300,
            maxHops: 2
        });

        vm.expectRevert(AgenticRouter.InvalidSlippage.selector);
        router.executeSwap(WETH, address(1), 1 ether, 0.9 ether, prefs);
    }

    function testValidatePreferences_InvalidMaxHops() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 5 // > 3 hops
        });

        vm.expectRevert(AgenticRouter.InvalidMaxHops.selector);
        router.executeSwap(WETH, address(1), 1 ether, 0.9 ether, prefs);
    }

    function testValidatePreferences_ZeroMaxHops() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 0 // Invalid
        });

        vm.expectRevert(AgenticRouter.InvalidMaxHops.selector);
        router.executeSwap(WETH, address(1), 1 ether, 0.9 ether, prefs);
    }

    function testValidatePreferences_ExpiredDeadline() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp - 1, // Expired
            maxHops: 2
        });

        vm.expectRevert(AgenticRouter.DeadlineExpired.selector);
        router.executeSwap(WETH, address(1), 1 ether, 0.9 ether, prefs);
    }

    // ============ Calculate Min Output Tests ============

    function testCalculateMinOutput_ZeroSlippage() public view {
        uint256 minOutput = router.calculateMinOutput(1000 ether, 0);
        assertEq(minOutput, 1000 ether);
    }

    function testCalculateMinOutput_HalfPercentSlippage() public view {
        uint256 minOutput = router.calculateMinOutput(1000 ether, 50);
        assertEq(minOutput, 995 ether); // 1000 * (10000 - 50) / 10000 = 995
    }

    function testCalculateMinOutput_OnePercentSlippage() public view {
        uint256 minOutput = router.calculateMinOutput(1000 ether, 100);
        assertEq(minOutput, 990 ether);
    }

    function testCalculateMinOutput_TenPercentSlippage() public view {
        uint256 minOutput = router.calculateMinOutput(1000 ether, 1000);
        assertEq(minOutput, 900 ether);
    }

    function testCalculateMinOutput_InvalidSlippage() public {
        vm.expectRevert(AgenticRouter.InvalidSlippage.selector);
        router.calculateMinOutput(1000 ether, 10001); // > 100%
    }

    // ============ Tick Spacing Tests ============

    function testGetTickSpacing_100() public view {
        assertEq(router.getTickSpacing(100), 1);
    }

    function testGetTickSpacing_500() public view {
        assertEq(router.getTickSpacing(500), 10);
    }

    function testGetTickSpacing_3000() public view {
        assertEq(router.getTickSpacing(3000), 60);
    }

    function testGetTickSpacing_10000() public view {
        assertEq(router.getTickSpacing(10000), 200);
    }

    function testGetTickSpacing_Invalid() public {
        vm.expectRevert(AgenticRouter.InvalidFeeTier.selector);
        router.getTickSpacing(2000);
    }

    // ============ Zero Amount Test ============

    function testExecuteSwap_ZeroAmount() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 2
        });

        vm.expectRevert(AgenticRouter.ZeroAmount.selector);
        router.executeSwap(WETH, address(1), 0, 0, prefs);
    }

    // ============ Same Token Test ============

    function testExecuteSwap_SameToken() public {
        AgenticRouter.SwapPreferences memory prefs = AgenticRouter.SwapPreferences({
            feeTier: 3000,
            slippageBps: 50,
            deadline: block.timestamp + 300,
            maxHops: 2
        });

        vm.expectRevert(AgenticRouter.InvalidTokenAddress.selector);
        router.executeSwap(WETH, WETH, 1 ether, 0.9 ether, prefs);
    }

    // ============ Fuzz Tests ============

    function testFuzz_CalculateMinOutput(uint256 expectedOutput, uint256 slippageBps) public view {
        // Bound inputs to reasonable ranges
        expectedOutput = bound(expectedOutput, 1, type(uint128).max);
        slippageBps = bound(slippageBps, 0, 10000);

        uint256 minOutput = router.calculateMinOutput(expectedOutput, slippageBps);

        // Verify math is correct
        assertEq(minOutput, (expectedOutput * (10000 - slippageBps)) / 10000);

        // Min output should always be <= expected
        assertLe(minOutput, expectedOutput);
    }

    function testFuzz_ValidFeeTiers(uint24 feeTier) public view {
        // Only valid fee tiers should return tick spacing
        if (feeTier == 100 || feeTier == 500 || feeTier == 3000 || feeTier == 10000) {
            int24 tickSpacing = router.getTickSpacing(feeTier);
            assertTrue(tickSpacing > 0);
        }
    }
}
