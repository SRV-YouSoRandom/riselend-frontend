import React from 'react';
import { ethers } from 'ethers';
import { WalletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { shortenAddress } from '../utils/formatters';
import { NETWORK_CONFIG } from '../contracts/addresses';

interface WalletConnectProps {
  provider: ethers.providers.Web3Provider | null;
  userAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  provider,
  userAddress,
  onConnect,
  onDisconnect,
}) => {
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
        }
      }
    }
  };

  if (!userAddress) {
    return (
      <button
        onClick={onConnect}
        className="btn-primary flex items-center gap-2"
      >
        <WalletIcon className="h-5 w-5" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={switchNetwork}
        className="btn-secondary text-sm"
      >
        {NETWORK_CONFIG.name}
      </button>
      
      <div className="relative group">
        <button className="btn-secondary flex items-center gap-2">
          <div className="w-3 h-3 bg-success-500 rounded-full"></div>
          {shortenAddress(userAddress)}
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <button
            onClick={onDisconnect}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};