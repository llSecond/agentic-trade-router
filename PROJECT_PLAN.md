# Agentic Trade Router - ETHGlobal HackMoney 2026

## Project Overview
An agent that auto-routes swaps on Uniswap v4 based on user ENS text records (preferred fee tier, slippage tolerance, route hints).

**Target Prizes:**
- ENS: Most Creative Use for DeFi ($1,500)
- Uniswap v4: Agentic Finance ($5,000 pool)

---

## ENS Text Record Schema

```
trade.slippage          → "0.5" (percent, e.g., 0.5%)
trade.feeTier           → "3000" (basis points: 500, 3000, or 10000)
trade.maxHops           → "2" (max routing hops)
trade.deadline          → "300" (seconds, default 5 min)
trade.preferredRouter   → "v4" (future: support v2/v3)
```

---

## Technical Architecture

### Frontend (Next.js + wagmi)
- Connect wallet (RainbowKit is fine, but we write custom ENS hooks)
- Read ENS text records for connected address
- Display user's trading preferences
- Swap interface with preference override
- Settings page to SET ENS text records

### Smart Contracts (Solidity + Foundry)
- AgenticRouter contract
  - Reads ENS text records (or takes params if no ENS)
  - Interfaces with Uniswap v4 PoolManager
  - Respects user preferences for routing
  
### Agent Logic
- Client-side: Read ENS preferences
- Smart contract: Execute swap with those preferences
- Fallback to sane defaults if no ENS records

---

## Development Phases

### Phase 1: ENS Integration (4-6 hours)
**Goal:** Read and write ENS text records

**Tasks:**
1. Set up Next.js project with wagmi
2. Create custom hook: `useENSTradePreferences(address)`
3. Build "Settings" page to set ENS text records
4. Test with your own ENS name (or create one on testnet)
5. Display preferences in UI

**Success Criteria:**
- Can read text records from any ENS name
- Can write text records to your ENS name
- Shows defaults when records don't exist

---

### Phase 2: Uniswap v4 Integration (6-8 hours)
**Goal:** Execute basic swaps on Uniswap v4

**Tasks:**
1. Clone Uniswap v4 template
2. Understand PoolManager interface
3. Write simple swap contract (no preferences yet)
4. Deploy to testnet
5. Execute test swap from frontend

**Success Criteria:**
- Can swap WETH → USDC on v4 testnet
- Have TxID to show judges
- Contract is verified on block explorer

---

### Phase 3: Connect ENS + Uniswap (4-6 hours)
**Goal:** Agent reads ENS and executes swaps accordingly

**Tasks:**
1. Modify swap contract to accept preferences
2. Frontend reads ENS, passes to contract
3. Contract respects slippage, fee tier, etc.
4. Test full flow

**Success Criteria:**
- Set ENS preferences → execute swap → swap respects preferences
- Can prove preferences were used (event logs, etc.)

---

### Phase 4: Polish & Submission (4-6 hours)
**Goal:** Make it demo-ready

**Tasks:**
1. Error handling & edge cases
2. Clean up UI (minimal but functional)
3. Write comprehensive README
4. Record demo video (3 min max)
5. Test setup instructions
6. Submit project

---

## Git Workflow

**Commit frequently!** Every 30-60 minutes minimum.

```bash
# Initial commit
git init
git add .
git commit -m "Initial project setup"

# Feature commits
git commit -m "Add ENS text record reading"
git commit -m "Add Uniswap v4 swap contract"
git commit -m "Connect ENS preferences to swap execution"

# Testing commits
git commit -m "Test ENS reading with testnet address"
git commit -m "Test swap on Sepolia"
```

---

## Demo Video Script (3 minutes)

**[0:00-0:20] Problem**
"Hey! I'm tired of setting slippage and routing preferences in every DeFi app. What if I could set them once in my ENS profile?"

**[0:20-0:50] Solution**
"I built an agentic trade router that reads your preferences from ENS text records and automatically applies them to Uniswap v4 swaps."

**[0:50-2:20] Demo**
1. Show ENS settings page → set slippage to 0.3%, fee tier to 3000
2. Go to swap page → show preferences loaded automatically
3. Execute swap → show transaction
4. Show on block explorer that preferences were respected

**[2:20-2:40] Technical Highlight**
"Here's the code: custom wagmi hooks read ENS, smart contract executes v4 swap with those params. All open source."

**[2:40-3:00] Wrap Up**
"Set your trading preferences once in ENS, use them everywhere. Built at ETHGlobal HackMoney 2026!"

---

## Resources & Links

### Uniswap v4
- Docs: https://docs.uniswap.org/contracts/v4/overview
- Template: https://github.com/uniswapfoundation/v4-template
- Course: https://updraft.cyfrin.io/courses/uniswap-v4

### ENS
- Docs: https://docs.ens.domains
- Text Records: https://docs.ens.domains/web/records
- Wagmi ENS: https://wagmi.sh/react/api/hooks/useEnsResolver

### Testing
- Sepolia Faucet: https://sepoliafaucet.com/
- Base Sepolia Faucet: https://www.alchemy.com/faucets/base-sepolia

---

## Troubleshooting

### ENS Issues
- **Text records return null**: Check if name exists, if records are set
- **Can't set text records**: Need to be name owner, need gas

### Uniswap Issues
- **Pool doesn't exist**: Use common pairs (WETH/USDC)
- **Swap reverts**: Check pool has liquidity, check slippage
- **Gas too high**: Simplify routing logic

### Testnet Issues
- **Faucet empty**: Try multiple faucets, ask in Discord
- **Network down**: Switch to backup testnet

---

## Submission Checklist

- [ ] GitHub repo is public
- [ ] README has setup instructions
- [ ] Demo video uploaded (max 3 min)
- [ ] TxIDs documented (testnet swaps)
- [ ] All code committed (no single massive commit)
- [ ] .gitignore includes node_modules, .env
- [ ] Contract addresses documented
- [ ] ENS text record schema documented

---

## Timeline (48 hours)

**Saturday**
- 9am-1pm: Phase 1 (ENS)
- 1pm-2pm: Lunch break
- 2pm-8pm: Phase 2 (Uniswap v4)
- 8pm-10pm: Phase 3 start

**Sunday**
- 9am-1pm: Finish Phase 3
- 1pm-2pm: Lunch
- 2pm-6pm: Phase 4 (polish)
- 6pm-8pm: Video recording
- 8pm: Submit

**Buffer:** 4 hours for unexpected issues
