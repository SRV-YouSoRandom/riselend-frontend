import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { WalletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { shortenAddress } from '../utils/formatters';
import { NETWORK_CONFIG } from '../contracts/addresses';

interface WalletConnectProps {
  provider: BrowserProvider | null;
  userAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  provider,
  userAddress,
  onConnect,
  onDisconnect,
  isConnecting = false,
}) => {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Check current network
  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          setCurrentChainId(chainId);
          setIsWrongNetwork(chainId !== NETWORK_CONFIG.chainId);
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };

    checkNetwork();
  }, [provider]);

  const switchNetwork = async () => {
    if (!provider) return;

    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }
      ]);
    } catch (error: any) {
      // Network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.name,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
              }
            }
          ]);
        } catch (addError) {
          console.error('Failed to add network:', addError);
          alert('Failed to add network. Please add it manually in your wallet.');
        }
      } else {
        console.error('Failed to switch network:', error);
        alert('Failed to switch network. Please switch manually in your wallet.');
      }
    }
  };

  if (!userAddress) {
    return (
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon className="h-5 w-5" />
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={switchNetwork}
        className={`btn-secondary text-sm ${
          isWrongNetwork ? 'bg-red-100 text-red-700 border-red-300' : ''
        }`}
      >
        {isWrongNetwork ? 'Wrong Network' : NETWORK_CONFIG.name}
      </button>
      
      <div className="relative group">
        <button className="btn-secondary flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isWrongNetwork ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          {shortenAddress(userAddress)}
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">Connected Account</p>
            <p className="text-sm font-medium text-gray-900">{shortenAddress(userAddress)}</p>
          </div>
          
          {currentChainId && (
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500">Network</p>
              <p className="text-sm font-medium text-gray-900">
                Chain ID: {currentChainId}
              </p>
            </div>
          )}
          
          <button
            onClick={onDisconnect}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};