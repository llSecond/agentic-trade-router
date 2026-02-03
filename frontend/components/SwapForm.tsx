'use client'

import { useState, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { sepolia } from 'wagmi/chains'
import { useSwap } from '@/hooks/useSwap'
import { TOKENS, SEPOLIA_ADDRESSES } from '@/lib/contracts'
import { PreferencesDisplay } from './PreferencesDisplay'

const tokens = TOKENS.sepolia

export function SwapForm() {
  const { address, isConnected } = useAccount()
  const [tokenInIndex, setTokenInIndex] = useState(0) // ETH
  const [tokenOutIndex, setTokenOutIndex] = useState(2) // USDC
  const [amountIn, setAmountIn] = useState('')
  const [showPreferences, setShowPreferences] = useState(false)

  const tokenIn = tokens[tokenInIndex]
  const tokenOut = tokens[tokenOutIndex]

  const { executeSwap, isLoading, error, txHash, formattedPreferences, hasENS, ensName, clearError } =
    useSwap()

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId: sepolia.id,
  })

  const handleSwap = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return
    }

    clearError()

    await executeSwap({
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      amountIn: amountIn,
      tokenInDecimals: tokenIn.decimals,
      tokenOutDecimals: tokenOut.decimals,
    })
  }, [amountIn, tokenIn, tokenOut, executeSwap, clearError])

  const handleTokenSwitch = () => {
    setTokenInIndex(tokenOutIndex)
    setTokenOutIndex(tokenInIndex)
    setAmountIn('')
  }

  const setMaxAmount = () => {
    if (tokenIn.symbol === 'ETH' && ethBalance) {
      // Leave some ETH for gas
      const maxEth = parseFloat(formatUnits(ethBalance.value, 18)) - 0.01
      setAmountIn(Math.max(0, maxEth).toFixed(6))
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to swap tokens</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Preferences Summary */}
      <PreferencesDisplay compact />

      {/* Swap Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Swap</h2>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showPreferences ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Token In */}
        <div className="bg-gray-800 rounded-lg p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">You pay</label>
            {tokenIn.symbol === 'ETH' && ethBalance && (
              <button onClick={setMaxAmount} className="text-xs text-blue-400 hover:text-blue-300">
                Max: {parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium focus:outline-none"
            />
            <select
              value={tokenInIndex}
              onChange={(e) => setTokenInIndex(Number(e.target.value))}
              className="select"
            >
              {tokens.map((token, i) => (
                <option key={token.address} value={i} disabled={i === tokenOutIndex}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleTokenSwitch}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Token Out */}
        <div className="bg-gray-800 rounded-lg p-4 mt-2">
          <label className="text-sm text-gray-400 block mb-2">You receive</label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value="--"
              disabled
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium text-gray-400"
            />
            <select
              value={tokenOutIndex}
              onChange={(e) => setTokenOutIndex(Number(e.target.value))}
              className="select"
            >
              {tokens.map((token, i) => (
                <option key={token.address} value={i} disabled={i === tokenInIndex}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preference Details */}
        {showPreferences && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Swap Settings {hasENS && `(from ${ensName})`}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Slippage:</span>{' '}
                <span>{formattedPreferences.slippage}</span>
              </div>
              <div>
                <span className="text-gray-500">Fee Tier:</span>{' '}
                <span>{formattedPreferences.feeTier}</span>
              </div>
              <div>
                <span className="text-gray-500">Max Hops:</span>{' '}
                <span>{formattedPreferences.maxHops}</span>
              </div>
              <div>
                <span className="text-gray-500">Deadline:</span>{' '}
                <span>{formattedPreferences.deadline}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {txHash && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">Transaction submitted!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400/70 hover:text-green-400 underline"
            >
              View on Etherscan
            </a>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isLoading || !amountIn || parseFloat(amountIn) <= 0}
          className="btn-primary w-full mt-4 py-3 text-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Swapping...
            </span>
          ) : (
            'Swap'
          )}
        </button>

        {/* Contract Warning */}
        {SEPOLIA_ADDRESSES.agenticRouter === '0x0000000000000000000000000000000000000000' && (
          <p className="text-xs text-yellow-400 text-center mt-2">
            AgenticRouter contract not deployed yet
          </p>
        )}
      </div>
    </div>
  )
}
