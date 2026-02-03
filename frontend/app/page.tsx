'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PreferencesDisplay } from '@/components/PreferencesDisplay'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Agentic Trade Router</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          A DeFi agent that reads your trading preferences from ENS text records and
          auto-routes swaps on Uniswap v4 with your personalized settings.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          title="ENS Preferences"
          description="Store your trading preferences (slippage, fee tier, deadline) in ENS text records. Your settings follow you everywhere."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <FeatureCard
          title="Uniswap v4"
          description="Execute swaps on Uniswap v4 with automatic fee tier selection based on your preferences."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          }
        />
        <FeatureCard
          title="Agentic Trading"
          description="Let the agent handle the complexity. Just set your preferences once and trade with confidence."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </section>

      {/* Preferences Display */}
      {isConnected && (
        <section>
          <PreferencesDisplay />
        </section>
      )}

      {/* How It Works */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Connect Your Wallet"
            description="Connect with any wallet that supports ENS names."
          />
          <Step
            number={2}
            title="Set Your Preferences"
            description="Configure your trading preferences (slippage, fee tier, max hops, deadline) in your ENS text records."
          />
          <Step
            number={3}
            title="Swap With Confidence"
            description="The agent reads your preferences and executes swaps on Uniswap v4 with your exact settings."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <div className="flex gap-4 justify-center">
          <Link href="/swap" className="btn-primary px-8 py-3 text-lg">
            Start Swapping
          </Link>
          <Link href="/settings" className="btn-secondary px-8 py-3 text-lg">
            Set Preferences
          </Link>
        </div>
      </section>

      {/* Technical Info */}
      <section className="card bg-gray-900/50">
        <h3 className="text-lg font-semibold mb-4">ENS Text Records Used</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-800 rounded-lg">
            <code className="text-blue-400">trade.slippage</code>
            <p className="text-gray-400 mt-1">Slippage tolerance (e.g., &quot;0.5&quot; for 0.5%)</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <code className="text-blue-400">trade.feeTier</code>
            <p className="text-gray-400 mt-1">Uniswap fee tier (100, 500, 3000, 10000)</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <code className="text-blue-400">trade.maxHops</code>
            <p className="text-gray-400 mt-1">Maximum routing hops (1-3)</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <code className="text-blue-400">trade.deadline</code>
            <p className="text-gray-400 mt-1">Transaction deadline in seconds (60-3600)</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="card">
      <div className="text-blue-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}
