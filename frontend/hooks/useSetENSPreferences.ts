// hooks/useSetENSPreferences.ts
// Custom hook to SET trading preferences in ENS text records

import { useWalletClient, usePublicClient } from 'wagmi'
import { useState } from 'react'
import { mainnet } from 'wagmi/chains'
import { normalize } from 'viem/ens'

// ENS Public Resolver address on mainnet
const ENS_PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'

export interface SetPreferencesParams {
  ensName: string
  slippage?: string
  feeTier?: string
  maxHops?: string
  deadline?: string
}

/**
 * Hook to set ENS text records for trading preferences
 * Only works if you own the ENS name
 */
export function useSetENSPreferences() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  /**
   * Set trading preferences in ENS text records
   * @param params - Preferences to set
   * @returns Transaction hash if successful
   */
  const setPreferences = async (params: SetPreferencesParams) => {
    if (!walletClient) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const { ensName, slippage, feeTier, maxHops, deadline } = params
      const normalizedName = normalize(ensName)

      // Get the resolver for this ENS name
      const resolver = await publicClient.getEnsResolver({
        name: normalizedName,
      })

      if (!resolver) {
        throw new Error('No resolver found for this ENS name')
      }

      // Build array of text records to set
      const updates: { key: string; value: string }[] = []
      if (slippage !== undefined) updates.push({ key: 'trade.slippage', value: slippage })
      if (feeTier !== undefined) updates.push({ key: 'trade.feeTier', value: feeTier })
      if (maxHops !== undefined) updates.push({ key: 'trade.maxHops', value: maxHops })
      if (deadline !== undefined) updates.push({ key: 'trade.deadline', value: deadline })

      // For simplicity, we'll set records one at a time
      // In production, you'd batch these into a multicall
      const txHashes: string[] = []

      for (const { key, value } of updates) {
        // This is a simplified version - actual implementation needs proper ABI
        // You'll need to call resolver.setText(node, key, value)
        console.log(`Setting ${key} = ${value} for ${ensName}`)
        
        // TODO: Implement actual setText call
        // This requires:
        // 1. Computing the node hash for the ENS name
        // 2. Calling setText on the resolver contract
        // 3. Waiting for transaction confirmation
        
        // Placeholder for now
        throw new Error('setText implementation needed - see ENS docs')
      }

      setIsLoading(false)
      return txHashes

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  return {
    setPreferences,
    isLoading,
    error,
  }
}

/**
 * Helper to validate preference values before setting
 */
export function validatePreferences(params: SetPreferencesParams): string | null {
  const { slippage, feeTier, maxHops, deadline } = params

  if (slippage !== undefined) {
    const val = parseFloat(slippage)
    if (isNaN(val) || val < 0 || val > 100) {
      return 'Slippage must be between 0 and 100'
    }
  }

  if (feeTier !== undefined) {
    const val = parseInt(feeTier, 10)
    if (isNaN(val) || ![100, 500, 3000, 10000].includes(val)) {
      return 'Fee tier must be 100, 500, 3000, or 10000'
    }
  }

  if (maxHops !== undefined) {
    const val = parseInt(maxHops, 10)
    if (isNaN(val) || val < 1 || val > 3) {
      return 'Max hops must be between 1 and 3'
    }
  }

  if (deadline !== undefined) {
    const val = parseInt(deadline, 10)
    if (isNaN(val) || val < 60 || val > 3600) {
      return 'Deadline must be between 60 and 3600 seconds'
    }
  }

  return null
}
