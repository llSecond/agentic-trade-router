'use client'

import { useAccount } from 'wagmi'
import { useENSTradePreferences, formatPreferences, DEFAULT_PREFERENCES } from '@/hooks/useENSTradePreferences'

interface PreferencesDisplayProps {
  compact?: boolean
}

export function PreferencesDisplay({ compact = false }: PreferencesDisplayProps) {
  const { address } = useAccount()
  const { preferences, isLoading, hasENS, ensName } = useENSTradePreferences(address)

  if (!address) {
    return (
      <div className="card">
        <p className="text-gray-400">Connect your wallet to view preferences</p>
      </div>
    )
  }

  const formatted = formatPreferences(preferences)
  const isDefault =
    preferences.slippage === DEFAULT_PREFERENCES.slippage &&
    preferences.feeTier === DEFAULT_PREFERENCES.feeTier &&
    preferences.maxHops === DEFAULT_PREFERENCES.maxHops &&
    preferences.deadline === DEFAULT_PREFERENCES.deadline

  if (compact) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Trading Preferences</span>
          {hasENS && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              {ensName}
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="animate-pulse h-4 bg-gray-700 rounded w-3/4" />
        ) : (
          <div className="flex gap-4 text-sm">
            <span>
              <span className="text-gray-400">Slippage:</span> {formatted.slippage}
            </span>
            <span>
              <span className="text-gray-400">Fee:</span> {formatted.feeTier}
            </span>
            <span>
              <span className="text-gray-400">Deadline:</span> {formatted.deadline}
            </span>
          </div>
        )}
        {!hasENS && (
          <p className="text-xs text-gray-500 mt-2">Using default preferences (no ENS name found)</p>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Trading Preferences</h2>
        {hasENS && (
          <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
            {ensName}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-6 bg-gray-800 rounded" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <PreferenceRow
              label="Slippage Tolerance"
              value={formatted.slippage}
              description="Maximum price impact you're willing to accept"
            />
            <PreferenceRow
              label="Fee Tier"
              value={formatted.feeTier}
              description="Uniswap pool fee tier to use"
            />
            <PreferenceRow
              label="Max Hops"
              value={formatted.maxHops}
              description="Maximum routing hops allowed"
            />
            <PreferenceRow
              label="Deadline"
              value={formatted.deadline}
              description="Transaction expiry time"
            />
          </div>

          {!hasENS && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                No ENS name found for your address. Using default preferences.
              </p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Get an ENS name and set your preferences on the Settings page.
              </p>
            </div>
          )}

          {hasENS && isDefault && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                No custom preferences found in your ENS text records.
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                Set your preferences on the Settings page.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface PreferenceRowProps {
  label: string
  value: string
  description: string
}

function PreferenceRow({ label, value, description }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span className="text-lg font-mono">{value}</span>
    </div>
  )
}
