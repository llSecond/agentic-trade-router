# Quick Reference Cheat Sheet

## ENS Text Record Keys
```
trade.slippage → "0.5"
trade.feeTier → "3000"
trade.maxHops → "2"
trade.deadline → "300"
```

## Fee Tiers (Uniswap)
- 100 = 0.01%
- 500 = 0.05%
- 3000 = 0.3% (most common)
- 10000 = 1%

## Wagmi Hooks - ENS

```typescript
// Get ENS name from address
const { data: ensName } = useEnsName({ address })

// Get resolver
const { data: resolver } = useEnsResolver({ name: ensName })

// Read text record
const textRecord = await resolver.getText('trade.slippage')
```

## Git Commands

```bash
# Every 30-60 minutes
git add .
git commit -m "Descriptive message"

# Check status
git status
git log --oneline

# View diff
git diff
```

## Common Contract Patterns

```solidity
// Validate fee tier
require(
    feeTier == 100 || feeTier == 500 || 
    feeTier == 3000 || feeTier == 10000,
    "Invalid fee tier"
);

// Calculate min output with slippage
minOutput = (expectedOutput * (10000 - slippageBps)) / 10000;

// Check deadline
require(block.timestamp <= deadline, "Expired");
```

## Test Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Test build

# Contracts
forge test           # Run tests
forge test -vvv      # Verbose
forge build          # Compile
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast
```

## Deployment Checklist

- [ ] Contract compiles (`forge build`)
- [ ] Tests pass (`forge test`)
- [ ] Have testnet ETH
- [ ] RPC URL in .env
- [ ] Private key in .env (BE CAREFUL!)
- [ ] Run deployment script
- [ ] Save contract address
- [ ] Verify on Etherscan

## Demo Video Script

1. **"Hi, I'm [name]"** (5 sec)
2. **Problem**: Too many DeFi settings (15 sec)
3. **Solution**: ENS + Agent (15 sec)
4. **Demo Part 1**: Show ENS preferences (30 sec)
5. **Demo Part 2**: Execute swap (30 sec)
6. **Code Walkthrough**: Quick peek (20 sec)
7. **Impact**: Set once, use everywhere (15 sec)
8. **Thanks + GitHub**: (10 sec)

**Total: ~2.5 minutes → leaves buffer**

## Testnet Info

**Sepolia:**
- Chain ID: 11155111
- RPC: https://rpc.sepolia.org
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

**Base Sepolia:**
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.alchemy.com/faucets/base-sepolia

## Emergency Contacts

- ENS Discord: https://chat.ens.domains
- Uniswap Discord: https://discord.gg/uniswap
- ETHGlobal Discord: [check your email]
- Mentor helpdesk: [at venue]

## Troubleshooting Quick Fixes

**ENS not resolving?**
→ Check you're on mainnet (ENS is on L1)
→ Try vitalik.eth as test

**Uniswap swap fails?**
→ Check pool exists
→ Check allowance
→ Increase slippage

**TypeScript errors?**
→ `npm install`
→ Restart TS server

**Git merge conflict?**
→ You should be solo, how did this happen?
→ `git reset --hard HEAD`

**Out of testnet ETH?**
→ Try alternative faucets
→ Ask in Discord
→ Ask mentor

## Keyboard Shortcuts

**VS Code:**
- Cmd/Ctrl + P: Quick file open
- Cmd/Ctrl + Shift + P: Command palette
- Cmd/Ctrl + `: Terminal
- Cmd/Ctrl + /: Comment line

**Terminal:**
- Ctrl + C: Kill process
- Ctrl + R: Search history
- !!: Repeat last command

## Keep These URLs Open

1. https://docs.ens.domains
2. https://docs.uniswap.org/contracts/v4/overview
3. https://wagmi.sh/react/api/hooks
4. https://sepolia.etherscan.io
5. Your GitHub repo
6. ETHGlobal submission page

## Time Management

| Time | Task |
|------|------|
| Hours 1-4 | ENS integration |
| Hours 5-10 | Uniswap v4 |
| Hours 11-14 | Connect both |
| Hours 15-18 | Testing |
| Hours 19-22 | Polish |
| Hours 23-24 | Video & submit |

**If behind schedule: CUT FEATURES, not quality**

## Code Snippets

### Wagmi Config (lib/wagmi.ts)
```typescript
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Agentic Trade Router',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
```

### Basic Swap Component
```typescript
export function SwapForm() {
  const { address } = useAccount()
  const { preferences } = useENSTradePreferences(address)
  
  const handleSwap = async () => {
    // Use preferences.slippage, preferences.feeTier, etc.
  }
  
  return (
    <div>
      <h2>Swap</h2>
      <p>Slippage: {preferences.slippage}%</p>
      {/* Swap UI */}
    </div>
  )
}
```

## Prize Judging Criteria (Remember!)

**ENS Prize:**
- Is ENS integration obvious and central?
- Does it improve the product meaningfully?
- Is it more than just name resolution?

**Uniswap Prize:**
- Does agent interact programmatically?
- Is it reliable and transparent?
- Good code quality?

**Both:**
- Working demo (VIDEO!)
- Open source code
- Clear README

## Final Pre-Submit Checklist

- [ ] Video recorded (<3 min)
- [ ] Video uploaded
- [ ] README has setup instructions
- [ ] GitHub repo is public
- [ ] All code committed (check `git log`)
- [ ] Contract addresses documented
- [ ] TxIDs included
- [ ] ENS text records explained
- [ ] Team info added
- [ ] Submitted on time!

---

**Remember: Shipped > Perfect**

Good luck! 🍀
