// hooks/useSwap.ts
// Hook to execute swaps via AgenticRouter using ENS preferences

import { useWriteContract, useAccount, usePublicClient, useReadContract } from 'wagmi'
import { useState, useCallback, useMemo } from 'react'
import { parseUnits, formatUnits } from 'viem'
import { sepolia } from 'wagmi/chains'
import {
  useENSTradePreferences,
  parseSlippage,
  parseFeeTier,
  parseMaxHops,
  parseDeadline,
  TradePreferences,
} from './useENSTradePreferences'
import { AGENTIC_ROUTER_ABI, SEPOLIA_ADDRESSES, ERC20_ABI } from '@/lib/contracts'

export interface SwapParams {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amountIn: string
  tokenInDecimals: number
  expectedAmountOut?: string
  tokenOutDecimals?: number
  overridePreferences?: Partial<TradePreferences>
}

export interface SwapResult {
  success: boolean
  txHash?: `0x${string}`
  error?: string
  amountOut?: string
}

/**
 * Hook to execute swaps via AgenticRouter
 * Reads preferences from ENS and applies them to swaps
 */
export function useSwap() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: sepolia.id })
  const { writeContractAsync } = useWriteContract()

  // Get ENS preferences
  const { preferences, isLoading: prefsLoading, hasENS, ensName } = useENSTradePreferences(address)

  /**
   * Calculate min amount out based on expected output and slippage
   */
  const calculateMinAmountOut = useCallback(
    (expectedAmountOut: bigint, slippageBps: number): bigint => {
      return (expectedAmountOut * BigInt(10000 - slippageBps)) / BigInt(10000)
    },
    []
  )

  /**
   * Execute a swap using AgenticRouter
   */
  const executeSwap = useCallback(
    async (params: SwapParams): Promise<SwapResult> => {
      if (!address) {
        const err = 'Wallet not connected'
        setError(err)
        return { success: false, error: err }
      }

      if (!publicClient) {
        const err = 'Public client not available'
        setError(err)
        return { success: false, error: err }
      }

      if (SEPOLIA_ADDRESSES.agenticRouter === '0x0000000000000000000000000000000000000000') {
        const err = 'AgenticRouter not deployed yet. Please deploy the contract first.'
        setError(err)
        return { success: false, error: err }
      }

      setIsLoading(true)
      setError(null)
      setTxHash(null)

      try {
        const { tokenIn, tokenOut, amountIn, tokenInDecimals, overridePreferences } = params

        // Merge ENS preferences with overrides
        const finalPrefs = {
          ...preferences,
          ...overridePreferences,
        }

        // Parse preferences to contract format
        const slippageBps = parseSlippage(finalPrefs.slippage)
        const feeTier = parseFeeTier(finalPrefs.feeTier)
        const maxHops = parseMaxHops(finalPrefs.maxHops)
        const deadlineSeconds = parseDeadline(finalPrefs.deadline)

        // Parse amount
        const amountInWei = parseUnits(amountIn, tokenInDecimals)

        // Calculate deadline timestamp
        const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds)

        // For now, use a simple min amount out calculation
        // In production, you'd get a quote first
        const expectedOut = params.expectedAmountOut
          ? parseUnits(params.expectedAmountOut, params.tokenOutDecimals || 18)
          : amountInWei // Fallback to 1:1 if no quote

        const minAmountOut = calculateMinAmountOut(expectedOut, slippageBps)

        // Check if we need to approve tokens (for non-ETH swaps)
        const isETHIn = tokenIn === '0x0000000000000000000000000000000000000000'

        if (!isETHIn) {
          // Check allowance
          const allowance = await publicClient.readContract({
            address: tokenIn,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [address, SEPOLIA_ADDRESSES.agenticRouter as `0x${string}`],
          })

          if (allowance < amountInWei) {
            // Approve tokens
            const approveHash = await writeContractAsync({
              address: tokenIn,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [SEPOLIA_ADDRESSES.agenticRouter as `0x${string}`, amountInWei],
              chainId: sepolia.id,
            })

            // Wait for approval
            await publicClient.waitForTransactionReceipt({ hash: approveHash })
          }
        }

        // Build swap preferences struct
        const swapPreferences = {
          feeTier: feeTier,
          slippageBps: BigInt(slippageBps),
          deadline: deadline,
          maxHops: maxHops,
        }

        // Execute swap
        const hash = await writeContractAsync({
          address: SEPOLIA_ADDRESSES.agenticRouter as `0x${string}`,
          abi: AGENTIC_ROUTER_ABI,
          functionName: 'executeSwap',
          args: [tokenIn, tokenOut, amountInWei, minAmountOut, swapPreferences],
          chainId: sepolia.id,
          value: isETHIn ? amountInWei : BigInt(0),
        })

        setTxHash(hash)
        setIsLoading(false)

        return { success: true, txHash: hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setIsLoading(false)
        return { success: false, error: errorMessage }
      }
    },
    [address, publicClient, writeContractAsync, preferences, calculateMinAmountOut]
  )

  /**
   * Get formatted preferences for display
   */
  const formattedPreferences = useMemo(() => {
    return {
      slippage: `${preferences.slippage || '0.5'}%`,
      feeTier: formatFeeTier(preferences.feeTier),
      maxHops: preferences.maxHops || '2',
      deadline: formatDeadline(preferences.deadline),
    }
  }, [preferences])

  return {
    executeSwap,
    isLoading: isLoading || prefsLoading,
    error,
    txHash,
    preferences,
    formattedPreferences,
    hasENS,
    ensName,
    clearError: () => setError(null),
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

/**
 * Hook to get token balance
 */
export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  const isETH = tokenAddress === '0x0000000000000000000000000000000000000000'

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!tokenAddress && !!userAddress && !isETH,
    },
  })

  return tokenBalance
}
