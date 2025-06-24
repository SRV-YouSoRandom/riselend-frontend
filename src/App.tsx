import React, { useState, useEffect } from 'react';
import { BrowserProvider, type Signer } from 'ethers';
import { WalletConnect } from './components/WalletConnect';
import { LendingInterface } from './components/LendingInterface';
import { UserPositions } from './components/UserPositions';
import { RiskMetrics } from './components/RiskMetrics';
import { useUserPositions } from './hooks/useUserPositions';
import { useHealthFactor } from './hooks/useHealthFactor';
import { useTokenBalances } from './hooks/useTokenBalances';
import './App.css';

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Custom hooks for data fetching
  const { positions, loading: positionsLoading, refetch: refetchPositions } = useUserPositions(
    provider,
    signer,
    userAddress
  );

  const { 
    healthFactor, 
    borrowingPower, 
    totalBorrows, 
    loading: healthLoading, 
    refetch: refetchHealth 
  } = useHealthFactor(provider, signer, userAddress);

  const { refetch: refetchBalances } = useTokenBalances(provider, userAddress);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send('eth_requestAccounts', []);
        const signer = await browserProvider.getSigner();
        
        setProvider(browserProvider);
        setSigner(signer);
        setUserAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
  };

  const handleTransactionComplete = async () => {
    // Refresh all data after a transaction
    try {
      await Promise.all([
        refetchPositions(),
        refetchHealth(),
        refetchBalances(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RL</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">RiseLend</h1>
            </div>
            
            <WalletConnect
              provider={provider}
              userAddress={userAddress}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <LendingInterface
              provider={provider}
              signer={signer}
              userAddress={userAddress}
              onTransactionComplete={handleTransactionComplete}
            />
            
            <RiskMetrics
              healthFactor={healthFactor}
              borrowingPower={borrowingPower}
              totalBorrows={totalBorrows}
              loading={healthLoading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <UserPositions
              positions={positions}
              loading={positionsLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;