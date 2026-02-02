# GETTING STARTED - DO THIS NOW

## Immediate Actions (Before Hackathon Starts)

### 1. Set Up Dev Environment ⚡

```bash
# Install Node.js if you haven't
# https://nodejs.org/ (get v18 or higher)

# Install Foundry for smart contracts
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installations
node --version  # Should be 18+
npm --version
forge --version
```

### 2. Get Testnet Funds 💰

Get ETH on Sepolia testnet (you'll need this for transactions):

- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Sepolia: https://sepoliafaucet.com/
- Coinbase Sepolia Faucet: https://www.coinbase.com/faucets/ethereum-sepolia-faucet

**Get at least 0.5 ETH on Sepolia** - you'll need it for:
- Deploying contracts
- Setting ENS text records
- Testing swaps

### 3. Set Up MetaMask

- Install MetaMask extension
- Add Sepolia network
- Import your test account
- Get testnet ETH into this wallet

### 4. Get or Create an ENS Name (Optional but Recommended)

For testing on mainnet ENS (just reading):
- Any address with an ENS name works
- Use a demo address: `vitalik.eth` → 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

For testing setting text records (on testnet):
- You'll need to deploy/use ENS on Sepolia
- Or just mock this part initially

---

## File Structure to Create

Once hacking starts, create this structure:

```
agentic-trade-router/
├── .gitignore              ✅ Created
├── package.json            ✅ Created
├── README.md               ✅ Created
├── PROJECT_PLAN.md         ✅ Created
│
├── frontend/               ⬅️ Create this
│   ├── app/
│   │   ├── page.tsx       # Home page
│   │   ├── swap/
│   │   │   └── page.tsx   # Swap interface
│   │   ├── settings/
│   │   │   └── page.tsx   # ENS preferences settings
│   │   └── layout.tsx     # Root layout with wagmi
│   ├── components/
│   │   ├── SwapForm.tsx
│   │   ├── PreferencesDisplay.tsx
│   │   └── SetPreferences.tsx
│   ├── hooks/
│   │   ├── useENSTradePreferences.ts  ✅ Created
│   │   └── useSetENSPreferences.ts    ✅ Created
│   └── lib/
│       └── wagmi.ts       # Wagmi config
│
└── contracts/             ⬅️ Create this
    ├── src/
    │   ├── AgenticRouter.sol        ✅ Scaffolded
    │   └── interfaces/
    │       └── IUniswapV4.sol
    ├── test/
    │   └── AgenticRouter.t.sol
    ├── script/
    │   └── Deploy.s.sol
    └── foundry.toml
```

---

## First Hour Checklist (When Hacking Starts)

### Hour 1: Project Initialization

- [ ] `git init` in project directory
- [ ] Copy `.gitignore`, `package.json`, `README.md` to project
- [ ] `git add . && git commit -m "Initial commit"`
- [ ] Create frontend/ directory: `npx create-next-app@latest frontend`
- [ ] Create contracts/ directory: `forge init contracts`
- [ ] Copy hooks and contract files to proper locations
- [ ] `git commit -m "Add project structure"`

### Hour 2-3: ENS Reading

- [ ] Set up wagmi config with RainbowKit
- [ ] Create simple page that shows connected address
- [ ] Implement ENS name display for connected address
- [ ] Test reading ENS text records (use vitalik.eth as test)
- [ ] Display parsed preferences in UI
- [ ] `git commit -m "Add ENS reading functionality"`

### Hour 4-6: Uniswap v4 Setup

- [ ] Clone Uniswap v4 template: `git clone https://github.com/uniswapfoundation/v4-template`
- [ ] Study their PoolManager interface
- [ ] Modify AgenticRouter.sol with actual v4 integration
- [ ] Write basic test for swap function
- [ ] Deploy to Sepolia testnet
- [ ] `git commit -m "Add Uniswap v4 integration"`

---

## Critical Resources to Read

**MUST READ before coding:**

1. **Uniswap v4 Docs**: https://docs.uniswap.org/contracts/v4/overview
   - Focus on: PoolManager, PoolKey, SwapParams
   
2. **ENS Text Records**: https://docs.ens.domains/web/records
   - How to read: resolver.getText(key)
   - How to set: resolver.setText(node, key, value)

3. **Wagmi ENS Hooks**: https://wagmi.sh/react/api/hooks/useEnsName
   - useEnsName, useEnsResolver, useEnsAvatar

**SKIM (reference as needed):**

4. Uniswap v4 Template: https://github.com/uniswapfoundation/v4-template
5. OpenZeppelin Hooks: https://docs.openzeppelin.com/uniswap-hooks

---

## Common Issues & Solutions

### Issue: "Can't find ENS name"
**Solution**: Make sure you're on mainnet for ENS lookups, or use a known address with ENS

### Issue: "Transaction reverts on Uniswap"
**Solution**: Check pool exists, has liquidity, and your slippage isn't too tight

### Issue: "Can't set ENS text records"
**Solution**: You need to own the ENS name. Use the Settings page to interact with resolver.

### Issue: "Import errors in TypeScript"
**Solution**: Make sure all dependencies are installed, check tsconfig.json paths

---

## Testing Strategy

### Phase 1: ENS (can test NOW)
```typescript
// Test with vitalik.eth
const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const { preferences } = useENSTradePreferences(address)
console.log(preferences) // Should show defaults or actual values
```

### Phase 2: Uniswap (need testnet setup)
```solidity
// In Foundry test
function testSwapWithPreferences() public {
    SwapPreferences memory prefs = SwapPreferences({
        feeTier: 3000,
        slippageBps: 50,
        deadline: block.timestamp + 300,
        maxHops: 2
    });
    
    uint256 amountOut = router.executeSwap(
        WETH,
        USDC,
        1 ether,
        0.99 ether, // Allow 1% slippage
        prefs
    );
    
    assertGt(amountOut, 0);
}
```

### Phase 3: Integration (end-to-end)
1. Connect wallet
2. See ENS preferences loaded
3. Execute swap
4. Verify on Etherscan that preferences were used

---

## Emergency Fallbacks

If something breaks catastrophically:

**Plan B: Simplify ENS**
- Just read ONE text record (`trade.slippage`)
- Hard-code other preferences

**Plan C: Mock ENS**
- Store preferences in localStorage
- Still show the ENS concept in slides

**Plan D: Skip Uniswap v4**
- Use v3 instead (more docs/examples)
- Still counts as routing based on preferences

**Plan E: No Smart Contract**
- Pure frontend demo
- Show ENS reading + mock swap transaction

---

## Success Metrics

**Minimum Viable Demo:**
- ✅ Can read ENS text records
- ✅ Can execute swap on Uniswap v4
- ✅ Preferences influence swap somehow
- ✅ Working video demo
- ✅ Clean git history

**Stretch Goals:**
- Setting ENS text records from UI
- Multi-hop routing based on maxHops
- Beautiful UI
- Deployed to mainnet

---

## Time Tracking

Keep track of where you spend time:
- ENS integration: ___ hours
- Uniswap v4 integration: ___ hours  
- Smart contract: ___ hours
- Frontend: ___ hours
- Testing: ___ hours
- Video/submission: ___ hours

**If any category goes >8 hours, STOP and simplify!**

---

## Questions to Answer Before You Start

1. Do I have testnet ETH? 
2. Do I have an ENS name (or know one to test with)?
3. Have I read the Uniswap v4 docs?
4. Do I understand the git workflow?
5. Is my dev environment ready?

**If NO to any → fix it first!**

---

## Let's Go! 🚀

When the hackathon starts:

```bash
# First commit
git init
git add .
git commit -m "Initial commit - Agentic Trade Router"

# Start building
npm run dev
```

Good luck! Remember: **working demo > perfect code**
