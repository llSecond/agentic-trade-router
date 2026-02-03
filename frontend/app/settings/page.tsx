'use client'

import { SetPreferences } from '@/components/SetPreferences'
import { PreferencesDisplay } from '@/components/PreferencesDisplay'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your trading preferences stored in ENS text records.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Preferences */}
        <PreferencesDisplay />

        {/* Set Preferences Form */}
        <SetPreferences />

        {/* Info Section */}
        <div className="card bg-gray-900/50">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">About ENS Text Records</h3>
          <div className="text-sm text-gray-500 space-y-3">
            <p>
              Your trading preferences are stored as text records on your ENS name. This allows
              any dApp or agent to read your preferences and apply them to trades automatically.
            </p>
            <p>
              Text records are stored on mainnet Ethereum, so you&apos;ll need to pay gas fees to
              update them. However, once set, they can be read for free by any application.
            </p>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-white font-medium mb-2">Supported Records:</p>
              <ul className="space-y-1">
                <li>
                  <code className="text-blue-400">trade.slippage</code> - Your slippage tolerance
                </li>
                <li>
                  <code className="text-blue-400">trade.feeTier</code> - Preferred Uniswap fee tier
                </li>
                <li>
                  <code className="text-blue-400">trade.maxHops</code> - Maximum routing hops
                </li>
                <li>
                  <code className="text-blue-400">trade.deadline</code> - Transaction deadline
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
