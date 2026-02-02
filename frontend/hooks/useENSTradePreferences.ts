// hooks/useENSTradePreferences.ts
// Custom hook to read trading preferences from ENS text records

import { useEnsResolver, useEnsName } from 'wagmi'
import { normalize } from 'viem/ens'
import { useEffect, useState } from 'react'
import { mainnet } from 'wagmi/chains'

export interface TradePreferences {
  slippage: string | null // e.g., "0.5" for 0.5%
  feeTier: string | null // e.g., "3000" for 0.3%
  maxHops: string | null // e.g., "2"
  deadline: string | null // e.g., "300" for 5 minutes
}

export const DEFAULT_PREFERENCES: TradePreferences = {
  slippage: '0.5',
  feeTier: '3000',
  maxHops: '2',
  deadline: '300',
}

/**
 * Hook to read trading preferences from ENS text records
 * @param address - Ethereum address to lookup ENS name and preferences
 * @returns Trading preferences or defaults if not set
 */
export function useENSTradePreferences(address?: `0x${string}`) {
  const [preferences, setPreferences] = useState<TradePreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(false)

  // Get ENS name for address
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })

  // Get resolver for ENS name
  const { data: resolver } = useEnsResolver({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  })

  useEffect(() => {
    async function fetchPreferences() {
      if (!resolver || !ensName) {
        setPreferences(DEFAULT_PREFERENCES)
        return
      }

      setIsLoading(true)

      try {
        // Read text records in parallel
        const [slippage, feeTier, maxHops, deadline] = await Promise.all([
          resolver.getText('trade.slippage'),
          resolver.getText('trade.feeTier'),
          resolver.getText('trade.maxHops'),
          resolver.getText('trade.deadline'),
        ])

        setPreferences({
          slippage: slippage || DEFAULT_PREFERENCES.slippage,
          feeTier: feeTier || DEFAULT_PREFERENCES.feeTier,
          maxHops: maxHops || DEFAULT_PREFERENCES.maxHops,
          deadline: deadline || DEFAULT_PREFERENCES.deadline,
        })
      } catch (error) {
        console.error('Error fetching ENS preferences:', error)
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [resolver, ensName])

  return {
    preferences,
    isLoading,
    hasENS: !!ensName,
    ensName,
  }
}

/**
 * Parse slippage from string to basis points
 * @param slippage - Slippage as string (e.g., "0.5" for 0.5%)
 * @returns Slippage in basis points (e.g., 50 for 0.5%)
 */
export function parseSlippage(slippage: string): number {
  const value = parseFloat(slippage)
  if (isNaN(value)) return 50 // Default 0.5%
  return Math.floor(value * 100) // Convert to basis points
}

/**
 * Parse fee tier from string to number
 * @param feeTier - Fee tier as string (e.g., "3000")
 * @returns Fee tier as number
 */
export function parseFeeTier(feeTier: string): number {
  const value = parseInt(feeTier, 10)
  if (isNaN(value)) return 3000 // Default 0.3%
  // Validate it's a known Uniswap fee tier
  if (![100, 500, 3000, 10000].includes(value)) return 3000
  return value
}

/**
 * Parse max hops from string to number
 * @param maxHops - Max hops as string (e.g., "2")
 * @returns Max hops as number
 */
export function parseMaxHops(maxHops: string): number {
  const value = parseInt(maxHops, 10)
  if (isNaN(value)) return 2 // Default 2 hops
  return Math.max(1, Math.min(value, 3)) // Clamp between 1-3
}

/**
 * Parse deadline from string to number
 * @param deadline - Deadline as string in seconds (e.g., "300")
 * @returns Deadline as number
 */
export function parseDeadline(deadline: string): number {
  const value = parseInt(deadline, 10)
  if (isNaN(value)) return 300 // Default 5 minutes
  return Math.max(60, Math.min(value, 3600)) // Clamp between 1 min - 1 hour
}
