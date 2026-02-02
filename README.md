# Agentic Trade Router

> Auto-route Uniswap v4 swaps based on ENS text record preferences

**ETHGlobal HackMoney 2026**

---

## 🎯 What is this?

An agentic trade router that reads your trading preferences from ENS text records and automatically applies them to Uniswap v4 swaps.

**Set your preferences once in ENS. Use them everywhere.**

---

## 🏆 Target Prizes

- **ENS**: Most Creative Use for DeFi ($1,500)
- **Uniswap Foundation**: Agentic Finance ($5,000 pool)

---

## ✨ Features

- 📝 Store trading preferences in ENS text records
- 🤖 Agent reads ENS and routes swaps accordingly
- 🦄 Integrates with Uniswap v4
- ⚙️ Customizable: slippage, fee tier, routing hints
- 🎨 Simple UI to set and view preferences

---

## 🗂️ ENS Text Record Schema

We use the following ENS text records:

| Key | Example Value | Description |
|-----|---------------|-------------|
| `trade.slippage` | `0.5` | Slippage tolerance (percent) |
| `trade.feeTier` | `3000` | Uniswap fee tier (500, 3000, 10000) |
| `trade.maxHops` | `2` | Maximum routing hops |
| `trade.deadline` | `300` | Transaction deadline (seconds) |

---

## 🏗️ Architecture

```
┌─────────────┐
│   User      │
│  (ENS name) │
└──────┬──────┘
       │
       │ 1. Set preferences
       ▼
┌─────────────────┐
│  ENS Registry   │
│  (Text Records) │
└──────┬──────────┘
       │
       │ 2. Read preferences
       ▼
┌─────────────────┐
│  Frontend       │
│  (Next.js)      │
└──────┬──────────┘
       │
       │ 3. Execute swap with preferences
       ▼
┌─────────────────┐
│ AgenticRouter   │
│ (Smart Contract)│
└──────┬──────────┘
       │
       │ 4. Route swap
       ▼
┌─────────────────┐
│  Uniswap v4     │
│  (PoolManager)  │
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- MetaMask or similar Web3 wallet
- Testnet ETH (Sepolia or Base Sepolia)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd agentic-trade-router

# Install frontend dependencies
npm install

# Install Foundry (for contracts)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install contract dependencies
cd contracts
forge install

# Return to root
cd ..
```

### Running Locally

```bash
# Start frontend
npm run dev

# In another terminal, start local Anvil node (optional)
anvil

# Deploy contracts (when ready)
cd contracts
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast
```

---

## 📋 Usage

### 1. Set Your ENS Preferences

Visit the Settings page and connect your wallet. If you own an ENS name, you can set your trading preferences:

- Slippage tolerance
- Preferred fee tier
- Max routing hops
- Transaction deadline

### 2. Execute a Swap

Go to the Swap page. Your preferences will automatically load from your ENS name. Execute swaps and the agent will respect your settings.

### 3. Override (Optional)

You can override your ENS preferences on a per-swap basis if needed.

---

## 📁 Project Structure

```
agentic-trade-router/
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components
│   ├── hooks/           # Custom wagmi hooks
│   └── utils/           # Utility functions
├── contracts/            # Solidity smart contracts
│   ├── src/             # Contract source
│   ├── test/            # Contract tests
│   └── script/          # Deployment scripts
├── docs/                # Additional documentation
└── README.md
```

---

## 🧪 Testing

### Frontend

```bash
npm run dev
# Test in browser at http://localhost:3000
```

### Smart Contracts

```bash
cd contracts
forge test
forge test -vvv  # Verbose output
```

---

## 🌐 Deployed Contracts

### Sepolia Testnet

- **AgenticRouter**: `0x...` (add after deployment)
- **Verification**: [Etherscan link]

### Base Sepolia

- **AgenticRouter**: `0x...` (add after deployment)
- **Verification**: [Basescan link]

---

## 📹 Demo Video

[Link to 3-minute demo video]

**Timestamps:**
- 0:00 - Problem & Solution
- 0:30 - Setting ENS preferences
- 1:00 - Executing swap with preferences
- 2:00 - Technical overview
- 2:45 - Conclusion

---

## 🔗 Resources

### Uniswap v4
- [Official Docs](https://docs.uniswap.org/contracts/v4/overview)
- [v4 Template](https://github.com/uniswapfoundation/v4-template)

### ENS
- [ENS Docs](https://docs.ens.domains)
- [Text Records Guide](https://docs.ens.domains/web/records)

---

## 🤝 Team

- [Your Name] - Full Stack Developer

---

## 📄 License

MIT License - Built at ETHGlobal HackMoney 2026

---

## 🙏 Acknowledgments

- ENS team for the flexible naming system
- Uniswap Foundation for v4
- ETHGlobal for hosting HackMoney
