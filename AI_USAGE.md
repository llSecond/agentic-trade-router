# AI Usage Documentation

> Required disclosure for ETHGlobal HackMoney 2026 submission

## AI Tools Used

- **Claude** (Anthropic) — Claude Opus 4.5 and 4.6 via Claude Code CLI
- Used throughout development for code generation, debugging, and review

## AI-Assisted Areas

### Smart Contracts
- `AgenticRouter.sol` — Contract structure, `executeSwap()` function, slippage calculation logic, validation modifiers
- `IUniversalRouter.sol` — Interface definitions for Universal Router, PoolManager, Permit2, ERC20
- `AgenticRouter.t.sol` — Unit test scaffolding and assertions
- `Deploy.s.sol` — Deployment script for Sepolia

### Frontend
- `useENSTradePreferences.ts` — Hook to read ENS text records via `publicClient.getEnsText()`
- `useSetENSPreferences.ts` — Hook to write ENS text records with `namehash` and `setText`
- `useSwap.ts` — Hook for executing swaps through AgenticRouter
- `SwapForm.tsx`, `PreferencesDisplay.tsx`, `SetPreferences.tsx` — Component layout and logic
- `wagmi.ts` — RainbowKit/wagmi configuration
- `contracts.ts` — ABI and address constants

### Configuration
- `next.config.mjs` — Next.js configuration and security headers
- `foundry.toml` — Foundry project configuration
- `.gitignore` — Git exclusion rules

### Security Review
- Identified unsafe WalletConnect fallback (`'YOUR_PROJECT_ID'` literal)
- Recommended security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Verified credential hygiene (private keys not tracked in git)

## Human Contributions

### Architecture & Design
- Chose ENS text records as the preference storage layer (key insight for ENS prize)
- Defined the `trade.*` text record schema (`trade.slippage`, `trade.feeTier`, `trade.maxHops`, `trade.deadline`)
- Selected Uniswap v4 Universal Router as the swap execution target
- Designed the agentic flow: ENS read -> preference extraction -> parameterized swap

### Strategy & Decisions
- Identified ENS ($1,500) and Uniswap Foundation Agentic Finance ($5,000) as target prize tracks
- Decided on Sepolia testnet for deployment (v4 contract availability)
- Chose RainbowKit over custom wallet connect UI for reliability

### Deployment & Testing
- Wallet setup and testnet ETH acquisition
- Contract deployment to Sepolia (`0xE39fc6A0120fe4297F81aB21821A666425cA538a`)
- Manual end-to-end testing of the full flow
- Verified all 14 contract tests pass

### Code Review
- All AI-generated code was reviewed and approved before committing
- Directed iterative fixes when initial outputs had issues (e.g., Next.js config format, ENS hook API)

## Verification

AI assistance is documented in git history via `Co-Authored-By` trailers:

```
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

See commits: `01c4082`, `a37248c`, `94e713d`
