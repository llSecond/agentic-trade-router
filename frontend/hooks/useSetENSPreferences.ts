// hooks/useSetENSPreferences.ts
// Custom hook to SET trading preferences in ENS text records
// Implements namehash computation and setText() calls

import { useWriteContract, usePublicClient, useAccount } from 'wagmi'
import { useState, useCallback } from 'react'
import { mainnet } from 'wagmi/chains'
import { namehash, normalize } from 'viem/ens'
import { ENS_RESOLVER_ABI } from '@/lib/contracts'

export interface SetPreferencesParams {
  ensName: string
  slippage?: string
  feeTier?: string
  maxHops?: string
  deadline?: string
}

export interface SetPreferencesResult {
  success: boolean
  txHashes: `0x${string}`[]
  error?: string
}

/**
 * Hook to set ENS text records for trading preferences
 * Only works if you own the ENS name
 */
export function useSetENSPreferences() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([])

  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: mainnet.id })
  const { writeContractAsync } = useWriteContract()

  /**
   * Set trading preferences in ENS text records
   * @param params - Preferences to set
   * @returns Transaction hashes if successful
   */
  const setPreferences = useCallback(
    async (params: SetPreferencesParams): Promise<SetPreferencesResult> => {
      if (!address) {
        const err = 'Wallet not connected'
        setError(err)
        return { success: false, txHashes: [], error: err }
      }

      if (!publicClient) {
        const err = 'Public client not available'
        setError(err)
        return { success: false, txHashes: [], error: err }
      }

      // Validate params first
      const validationError = validatePreferences(params)
      if (validationError) {
        setError(validationError)
        return { success: false, txHashes: [], error: validationError }
      }

      setIsLoading(true)
      setError(null)
      setTxHashes([])

      try {
        const { ensName, slippage, feeTier, maxHops, deadline } = params
        const normalizedName = normalize(ensName)

        // Get the resolver for this ENS name
        const resolverAddress = await publicClient.getEnsResolver({
          name: normalizedName,
        })

        if (!resolverAddress) {
          throw new Error('No resolver found for this ENS name')
        }

        // Compute the namehash for the ENS name
        const node = namehash(normalizedName)

        // Build array of text records to set
        const updates: { key: string; value: string }[] = []
        if (slippage !== undefined) updates.push({ key: 'trade.slippage', value: slippage })
        if (feeTier !== undefined) updates.push({ key: 'trade.feeTier', value: feeTier })
        if (maxHops !== undefined) updates.push({ key: 'trade.maxHops', value: maxHops })
        if (deadline !== undefined) updates.push({ key: 'trade.deadline', value: deadline })

        if (updates.length === 0) {
          throw new Error('No preferences to update')
        }

        // Execute setText for each preference
        const hashes: `0x${string}`[] = []

        for (const { key, value } of updates) {
          console.log(`Setting ${key} = ${value} for ${ensName}`)

          const hash = await writeContractAsync({
            address: resolverAddress,
            abi: ENS_RESOLVER_ABI,
            functionName: 'setText',
            args: [node, key, value],
            chainId: mainnet.id,
          })

          hashes.push(hash)
        }

        setTxHashes(hashes)
        setIsLoading(false)
        return { success: true, txHashes: hashes }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setIsLoading(false)
        return { success: false, txHashes: [], error: errorMessage }
      }
    },
    [address, publicClient, writeContractAsync]
  )

  /**
   * Set a single preference
   */
  const setSinglePreference = useCallback(
    async (
      ensName: string,
      key: 'slippage' | 'feeTier' | 'maxHops' | 'deadline',
      value: string
    ): Promise<`0x${string}` | null> => {
      const params: SetPreferencesParams = { ensName, [key]: value }
      const result = await setPreferences(params)
      return result.success ? result.txHashes[0] : null
    },
    [setPreferences]
  )

  return {
    setPreferences,
    setSinglePreference,
    isLoading,
    error,
    txHashes,
    clearError: () => setError(null),
  }
}

/**
 * Helper to validate preference values before setting
 */
export function validatePreferences(params: SetPreferencesParams): string | null {
  const { ensName, slippage, feeTier, maxHops, deadline } = params

  if (!ensName || ensName.trim() === '') {
    return 'ENS name is required'
  }

  // Basic ENS name validation
  if (!ensName.includes('.')) {
    return 'Invalid ENS name format'
  }

  if (slippage !== undefined) {
    const val = parseFloat(slippage)
    if (isNaN(val) || val < 0 || val > 10) {
      return 'Slippage must be between 0 and 10%'
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

/**
 * Format fee tier for display
 */
export function formatFeeTierOption(tier: number): string {
  switch (tier) {
    case 100:
      return '0.01% - Best for stable pairs'
    case 500:
      return '0.05% - Best for stable/major pairs'
    case 3000:
      return '0.3% - Best for most pairs'
    case 10000:
      return '1% - Best for exotic pairs'
    default:
      return `${tier / 10000}%`
  }
}
