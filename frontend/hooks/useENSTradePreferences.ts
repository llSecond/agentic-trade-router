// hooks/useENSTradePreferences.ts
// Custom hook to read trading preferences from ENS text records
// Fixed to use publicClient.getEnsText() instead of resolver.getText()

import { useEnsName, usePublicClient } from 'wagmi'
import { normalize } from 'viem/ens'
import { mainnet } from 'wagmi/chains'
import { useQuery } from '@tanstack/react-query'

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
 * Uses publicClient.getEnsText() which is the correct wagmi v2 API
 * @param address - Ethereum address to lookup ENS name and preferences
 * @returns Trading preferences or defaults if not set
 */
export function useENSTradePreferences(address?: `0x${string}`) {
  // Get public client for mainnet (ENS is on mainnet)
  const publicClient = usePublicClient({ chainId: mainnet.id })

  // Get ENS name for address
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })

  // Fetch preferences using TanStack Query
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ensTradePreferences', ensName],
    queryFn: async (): Promise<TradePreferences> => {
      if (!ensName || !publicClient) {
        return DEFAULT_PREFERENCES
      }

      try {
        const normalizedName = normalize(ensName)

        // Read text records in parallel using the correct viem API
        const [slippage, feeTier, maxHops, deadline] = await Promise.all([
          publicClient.getEnsText({ name: normalizedName, key: 'trade.slippage' }),
          publicClient.getEnsText({ name: normalizedName, key: 'trade.feeTier' }),
          publicClient.getEnsText({ name: normalizedName, key: 'trade.maxHops' }),
          publicClient.getEnsText({ name: normalizedName, key: 'trade.deadline' }),
        ])

        return {
          slippage: slippage || DEFAULT_PREFERENCES.slippage,
          feeTier: feeTier || DEFAULT_PREFERENCES.feeTier,
          maxHops: maxHops || DEFAULT_PREFERENCES.maxHops,
          deadline: deadline || DEFAULT_PREFERENCES.deadline,
        }
      } catch (error) {
        console.error('Error fetching ENS preferences:', error)
        return DEFAULT_PREFERENCES
      }
    },
    enabled: !!ensName && !!publicClient,
    staleTime: 60 * 1000, // Cache for 1 minute
  })

  return {
    preferences: preferences || DEFAULT_PREFERENCES,
    isLoading,
    error,
    hasENS: !!ensName,
    ensName,
    refetch,
  }
}

/**
 * Parse slippage from string to basis points
 * @param slippage - Slippage as string (e.g., "0.5" for 0.5%)
 * @returns Slippage in basis points (e.g., 50 for 0.5%)
 */
export function parseSlippage(slippage: string | null): number {
  if (!slippage) return 50 // Default 0.5%
  const value = parseFloat(slippage)
  if (isNaN(value)) return 50
  return Math.floor(value * 100) // Convert to basis points
}

/**
 * Parse fee tier from string to number
 * @param feeTier - Fee tier as string (e.g., "3000")
 * @returns Fee tier as number
 */
export function parseFeeTier(feeTier: string | null): number {
  if (!feeTier) return 3000 // Default 0.3%
  const value = parseInt(feeTier, 10)
  if (isNaN(value)) return 3000
  // Validate it's a known Uniswap fee tier
  if (![100, 500, 3000, 10000].includes(value)) return 3000
  return value
}

/**
 * Parse max hops from string to number
 * @param maxHops - Max hops as string (e.g., "2")
 * @returns Max hops as number
 */
export function parseMaxHops(maxHops: string | null): number {
  if (!maxHops) return 2 // Default 2 hops
  const value = parseInt(maxHops, 10)
  if (isNaN(value)) return 2
  return Math.max(1, Math.min(value, 3)) // Clamp between 1-3
}

/**
 * Parse deadline from string to number
 * @param deadline - Deadline as string in seconds (e.g., "300")
 * @returns Deadline as number
 */
export function parseDeadline(deadline: string | null): number {
  if (!deadline) return 300 // Default 5 minutes
  const value = parseInt(deadline, 10)
  if (isNaN(value)) return 300
  return Math.max(60, Math.min(value, 3600)) // Clamp between 1 min - 1 hour
}

/**
 * Get formatted display values for preferences
 */
export function formatPreferences(prefs: TradePreferences) {
  return {
    slippage: `${prefs.slippage || '0.5'}%`,
    feeTier: formatFeeTier(prefs.feeTier),
    maxHops: prefs.maxHops || '2',
    deadline: formatDeadline(prefs.deadline),
  }
}

function formatFeeTier(feeTier: string | null): string {
  const tier = parseInt(feeTier || '3000', 10)
  switch (tier) {
    case 100:
      return '0.01%'
    case 500:
      return '0.05%'
    case 3000:
      return '0.3%'
    case 10000:
      return '1%'
    default:
      return '0.3%'
  }
}

function formatDeadline(deadline: string | null): string {
  const seconds = parseInt(deadline || '300', 10)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m`
}
