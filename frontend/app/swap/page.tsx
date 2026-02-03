'use client'

import { SwapForm } from '@/components/SwapForm'

export default function SwapPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Swap Tokens</h1>
        <p className="text-gray-400">
          Execute swaps on Uniswap v4 using your ENS trading preferences.
        </p>
      </div>

      <SwapForm />

      {/* Info Section */}
      <div className="mt-8 card bg-gray-900/50">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">About This Swap</h3>
        <ul className="text-sm text-gray-500 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">1.</span>
            Your trading preferences are read from your ENS name&apos;s text records
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">2.</span>
            The swap is routed through Uniswap v4 on Sepolia testnet
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">3.</span>
            Slippage protection is automatically applied based on your settings
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">4.</span>
            The selected fee tier determines which liquidity pool is used
          </li>
        </ul>
      </div>
    </div>
  )
}
