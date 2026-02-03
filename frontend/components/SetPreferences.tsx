'use client'

import { useState, useCallback } from 'react'
import { useAccount, useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { useSetENSPreferences, validatePreferences, formatFeeTierOption } from '@/hooks/useSetENSPreferences'
import { useENSTradePreferences, DEFAULT_PREFERENCES } from '@/hooks/useENSTradePreferences'

const FEE_TIERS = [100, 500, 3000, 10000]

export function SetPreferences() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id })

  // Get current preferences
  const { preferences, isLoading: prefsLoading } = useENSTradePreferences(address)

  // Form state
  const [slippage, setSlippage] = useState('')
  const [feeTier, setFeeTier] = useState('')
  const [maxHops, setMaxHops] = useState('')
  const [deadline, setDeadline] = useState('')
  const [customEnsName, setCustomEnsName] = useState('')

  const { setPreferences, isLoading, error, txHashes, clearError } = useSetENSPreferences()

  // Use connected ENS or custom input
  const nameToUse = ensName || customEnsName

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      clearError()

      if (!nameToUse) {
        return
      }

      // Only include values that have been changed
      const params = {
        ensName: nameToUse,
        ...(slippage && { slippage }),
        ...(feeTier && { feeTier }),
        ...(maxHops && { maxHops }),
        ...(deadline && { deadline }),
      }

      // Validate
      const validationError = validatePreferences(params)
      if (validationError) {
        return
      }

      await setPreferences(params)
    },
    [nameToUse, slippage, feeTier, maxHops, deadline, setPreferences, clearError]
  )

  const resetForm = () => {
    setSlippage('')
    setFeeTier('')
    setMaxHops('')
    setDeadline('')
  }

  if (!isConnected) {
    return (
      <div className="card text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to manage preferences</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Set Trading Preferences</h2>

      {/* ENS Name Display/Input */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        {ensName ? (
          <div>
            <p className="text-sm text-gray-400">Your ENS Name</p>
            <p className="text-xl font-medium">{ensName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Preferences will be saved to this ENS name&apos;s text records
            </p>
          </div>
        ) : (
          <div>
            <label className="label">ENS Name (you must own this name)</label>
            <input
              type="text"
              value={customEnsName}
              onChange={(e) => setCustomEnsName(e.target.value)}
              placeholder="yourname.eth"
              className="input w-full"
            />
            <p className="text-xs text-yellow-400 mt-1">
              No ENS name found for your address. Enter one you own.
            </p>
          </div>
        )}
      </div>

      {/* Current Values */}
      {!prefsLoading && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Current Values</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              Slippage: <span className="text-white">{preferences.slippage}%</span>
            </div>
            <div>
              Fee Tier: <span className="text-white">{preferences.feeTier}</span>
            </div>
            <div>
              Max Hops: <span className="text-white">{preferences.maxHops}</span>
            </div>
            <div>
              Deadline: <span className="text-white">{preferences.deadline}s</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Slippage */}
        <div>
          <label className="label">Slippage Tolerance (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            placeholder={preferences.slippage || DEFAULT_PREFERENCES.slippage || '0.5'}
            className="input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum price impact you&apos;re willing to accept (0-10%)
          </p>
        </div>

        {/* Fee Tier */}
        <div>
          <label className="label">Fee Tier</label>
          <select
            value={feeTier}
            onChange={(e) => setFeeTier(e.target.value)}
            className="select w-full"
          >
            <option value="">
              Current: {formatFeeTierOption(parseInt(preferences.feeTier || '3000', 10))}
            </option>
            {FEE_TIERS.map((tier) => (
              <option key={tier} value={tier.toString()}>
                {formatFeeTierOption(tier)}
              </option>
            ))}
          </select>
        </div>

        {/* Max Hops */}
        <div>
          <label className="label">Maximum Routing Hops</label>
          <select
            value={maxHops}
            onChange={(e) => setMaxHops(e.target.value)}
            className="select w-full"
          >
            <option value="">Current: {preferences.maxHops || '2'}</option>
            <option value="1">1 - Direct swap only</option>
            <option value="2">2 - Up to 2 hops</option>
            <option value="3">3 - Up to 3 hops</option>
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="label">Transaction Deadline (seconds)</label>
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="select w-full"
          >
            <option value="">Current: {preferences.deadline || '300'}s</option>
            <option value="60">60s (1 minute)</option>
            <option value="180">180s (3 minutes)</option>
            <option value="300">300s (5 minutes)</option>
            <option value="600">600s (10 minutes)</option>
            <option value="1800">1800s (30 minutes)</option>
            <option value="3600">3600s (1 hour)</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {txHashes.length > 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400 mb-2">
              Preferences saved! {txHashes.length} transaction(s) submitted.
            </p>
            {txHashes.map((hash, i) => (
              <a
                key={hash}
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-green-400/70 hover:text-green-400 underline"
              >
                Transaction {i + 1}
              </a>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || !nameToUse || (!slippage && !feeTier && !maxHops && !deadline)}
            className="btn-primary flex-1 py-3"
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
                Saving...
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
          <button type="button" onClick={resetForm} className="btn-secondary px-6">
            Reset
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center">
          Saving preferences will submit transactions to mainnet Ethereum.
          <br />
          Each preference field is stored as a separate text record.
        </p>
      </form>
    </div>
  )
}
