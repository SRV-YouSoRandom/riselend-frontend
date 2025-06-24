import { useState, useEffect } from 'react';
import { BrowserProvider, type Signer } from 'ethers';
import './App.css';

// Components
import { WalletConnect } from './components/WalletConnect';
import { LendingInterface } from './components/LendingInterface';
import { UserPositions } from './components/UserPositions';
import { RiskMetrics } from './components/RiskMetrics';

// Hooks
import { useUserPositions } from './hooks/useUserPositions';
import { useHealthFactor } from './hooks/useHealthFactor';

// Types
declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Custom hooks
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

  // Wallet connection functions
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet');
      return;
    }

    setConnecting(true);
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setUserAddress(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
  };

  const handleTransactionComplete = () => {
    // Refresh all data after a transaction
    refetchPositions();
    refetchHealth();
  };

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            const signer = await browserProvider.getSigner();
            const address = await signer.getAddress();

            setProvider(browserProvider);
            setSigner(signer);
            setUserAddress(address);
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== userAddress) {
          // Account changed, reconnect
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [userAddress]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Omu<span className="text-blue-600">Rise</span>
                </h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <span className="text-gray-500 text-sm">
                  Decentralized Lending Protocol
                </span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletConnect
                provider={provider}
                userAddress={userAddress}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connecting && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Connecting wallet...</span>
          </div>
        )}

        {!userAddress && !connecting ? (
          /* Welcome Screen */
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to RiseLend
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Supply assets to earn interest or borrow against your collateral on the Risechain network
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Supply Assets</h3>
                  <p className="text-gray-600 text-sm">
                    Deposit your crypto assets and earn competitive interest rates
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Borrow Assets</h3>
                  <p className="text-gray-600 text-sm">
                    Use your deposits as collateral to borrow other assets
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stay Safe</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your health factor and manage risk effectively
                  </p>
                </div>
              </div>

              <button
                onClick={connectWallet}
                className="btn-primary text-lg px-8 py-3"
              >
                Connect Wallet to Get Started
              </button>
            </div>
          </div>
        ) : userAddress && (
          /* Dashboard */
          <div className="space-y-8">
            {/* Risk Overview */}
            <RiskMetrics
              healthFactor={healthFactor}
              borrowingPower={borrowingPower}
              totalBorrows={totalBorrows}
              loading={healthLoading}
            />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Lending Interface */}
              <LendingInterface
                provider={provider}
                signer={signer}
                userAddress={userAddress}
                onTransactionComplete={handleTransactionComplete}
              />

              {/* User Positions */}
              <UserPositions
                positions={positions}
                loading={positionsLoading}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 RiseLend. Built on Risechain Testnet.</p>
            <p className="mt-2">
              This is a demo application. Please use with caution on testnet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;