import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Agentic Trade Router',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia],
  ssr: true,
})

// Re-export chains for use in components
export { mainnet, sepolia }
