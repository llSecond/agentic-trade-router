// Contract addresses for different networks

// Sepolia Testnet Addresses
export const SEPOLIA_ADDRESSES = {
  agenticRouter: '0xE39fc6A0120fe4297F81aB21821A666425cA538a',
  universalRouter: '0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b',
  poolManager: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
  permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
} as const

// Mainnet ENS Addresses
export const MAINNET_ADDRESSES = {
  ensPublicResolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
} as const

// AgenticRouter ABI
export const AGENTIC_ROUTER_ABI = [
  {
    inputs: [
      { name: '_universalRouter', type: 'address' },
      { name: '_poolManager', type: 'address' },
      { name: '_permit2', type: 'address' },
      { name: '_weth', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'DeadlineExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientOutput',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFeeTier',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMaxHops',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSlippage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidTokenAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAmount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'tokenIn', type: 'address' },
      { indexed: false, name: 'tokenOut', type: 'address' },
      { indexed: false, name: 'amountIn', type: 'uint256' },
      { indexed: false, name: 'amountOut', type: 'uint256' },
      { indexed: false, name: 'feeTier', type: 'uint24' },
      { indexed: false, name: 'slippageBps', type: 'uint256' },
    ],
    name: 'SwapExecuted',
    type: 'event',
  },
  {
    inputs: [
      { name: 'expectedOutput', type: 'uint256' },
      { name: 'slippageBps', type: 'uint256' },
    ],
    name: 'calculateMinOutput',
    outputs: [{ name: 'minOutput', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      {
        name: 'preferences',
        type: 'tuple',
        components: [
          { name: 'feeTier', type: 'uint24' },
          { name: 'slippageBps', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'maxHops', type: 'uint8' },
        ],
      },
    ],
    name: 'executeSwap',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'feeTier', type: 'uint24' }],
    name: 'getTickSpacing',
    outputs: [{ name: 'tickSpacing', type: 'int24' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'permit2',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolManager',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'universalRouter',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'weth',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ENS Resolver ABI for setText
export const ENS_RESOLVER_ABI = [
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    name: 'setText',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    name: 'text',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Token list for Sepolia
export const TOKENS = {
  sepolia: [
    {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
    },
    {
      address: SEPOLIA_ADDRESSES.weth as `0x${string}`,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    {
      address: SEPOLIA_ADDRESSES.usdc as `0x${string}`,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  ],
} as const
