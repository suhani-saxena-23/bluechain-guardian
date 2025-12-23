import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Shield, ShoppingCart, Wallet, Waves } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TabType } from '@/types';

interface RoleCard {
  id: TabType;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const roleCards: RoleCard[] = [
  {
    id: 'generator',
    title: 'Generator',
    description: 'NGOs & Communities submitting blue carbon projects',
    icon: <Leaf className="w-7 h-7" />,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'validator',
    title: 'Validator',
    description: 'Auditors & Verifiers reviewing project data',
    icon: <Shield className="w-7 h-7" />,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'consumer',
    title: 'Consumer',
    description: 'Carbon credit buyers & offset seekers',
    icon: <ShoppingCart className="w-7 h-7" />,
    gradient: 'from-violet-500 to-purple-600',
  },
];

const HomeScreen: React.FC = () => {
  const { setActiveTab, wallet, connectWallet } = useApp();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with gradient */}
      <div className="gradient-header pt-16 pb-12 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
        
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <Waves className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">BlueChain MRV</h1>
          <p className="text-white/80 text-sm">
            Verify Carbon Credits with Trust & Transparency
          </p>
        </motion.div>
      </div>

      {/* Role selection cards */}
      <div className="flex-1 px-5 -mt-6 overflow-y-auto pb-28 scrollbar-hide">
        <div className="space-y-4">
          {roleCards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setActiveTab(card.id)}
              className="w-full card-elevated p-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{card.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{card.description}</p>
              </div>
              <div className="text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Connect Wallet CTA */}
      <div className="absolute bottom-20 left-0 right-0 px-5 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          onClick={connectWallet}
          disabled={wallet.isConnected}
          className={`btn-primary flex items-center justify-center gap-3 ${wallet.isConnected ? 'opacity-60' : ''}`}
        >
          <Wallet className="w-5 h-5" />
          <span>{wallet.isConnected ? `Connected: ${wallet.address}` : 'Connect Wallet'}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default HomeScreen;
