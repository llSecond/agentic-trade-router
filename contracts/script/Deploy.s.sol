// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgenticRouter.sol";

contract DeployScript is Script {
    // Sepolia addresses
    address constant UNIVERSAL_ROUTER = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        AgenticRouter router = new AgenticRouter(
            UNIVERSAL_ROUTER,
            POOL_MANAGER,
            PERMIT2,
            WETH
        );

        console.log("AgenticRouter deployed to:", address(router));
        console.log("Universal Router:", UNIVERSAL_ROUTER);
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("Permit2:", PERMIT2);
        console.log("WETH:", WETH);

        vm.stopBroadcast();
    }
}
