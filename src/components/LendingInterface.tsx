import React, { useState } from 'react';
import { BrowserProvider, type Signer, parseUnits, Contract } from 'ethers';
import { PlusIcon, MinusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useContract } from '../hooks/useContract';
import { ASSETS } from '../contracts/addresses';
import { parseInputAmount } from '../utils/formatters';

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

interface LendingInterfaceProps {
  provider: BrowserProvider | null;
  signer: Signer | null;
  userAddress: string | null;
  onTransactionComplete: () => void;
}

type ActionType = 'supply' | 'withdraw' | 'borrow' | 'repay';

export const LendingInterface: React.FC<LendingInterfaceProps> = ({
  provider,
  signer,
  userAddress,
  onTransactionComplete,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<keyof typeof ASSETS>('USDT');
  const [action, setAction] = useState<ActionType>('supply');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contracts = useContract(provider, signer);

  const handleTransaction = async () => {
    if (!contracts || !userAddress || !amount) return;

    setLoading(true);
    setError(null);

    try {
      const asset = ASSETS[selectedAsset];
      const amountWei = parseInputAmount(amount, asset.decimals);

      let tx;

      switch (action) {
        case 'supply':
          // For supply, we need to approve the token first (except for ETH)
          if (asset.symbol !== 'ETH') {
            const tokenContract = new Contract(asset.address, ERC20_ABI, signer);
            
            // Check current allowance
            const allowance = await tokenContract.allowance(userAddress, contracts.lendingPool.target);
            
            if (allowance < parseUnits(amount, asset.decimals)) {
              // Approve tokens
              const approveTx = await tokenContract.approve(
                contracts.lendingPool.target,
                parseUnits(amount, asset.decimals)
              );
              await approveTx.wait();
            }
          }

          // Supply the asset
          if (asset.symbol === 'ETH') {
            tx = await contracts.lendingPool.supply(asset.address, amountWei, {
              value: amountWei
            });
          } else {
            tx = await contracts.lendingPool.supply(asset.address, amountWei);
          }
          break;

        case 'withdraw':
          tx = await contracts.lendingPool.withdraw(asset.address, amountWei);
          break;

        case 'borrow':
          tx = await contracts.lendingPool.borrow(asset.address, amountWei);
          break;

        case 'repay':
          // For repay, we need to approve the token first (except for ETH)
          if (asset.symbol !== 'ETH') {
            const tokenContract = new Contract(asset.address, ERC20_ABI, signer);
            
            // Check current allowance
            const allowance = await tokenContract.allowance(userAddress, contracts.lendingPool.target);
            
            if (allowance < parseUnits(amount, asset.decimals)) {
              // Approve tokens
              const approveTx = await tokenContract.approve(
                contracts.lendingPool.target,
                parseUnits(amount, asset.decimals)
              );
              await approveTx.wait();
            }
          }

          // Repay the asset
          if (asset.symbol === 'ETH') {
            tx = await contracts.lendingPool.repay(asset.address, amountWei, {
              value: amountWei
            });
          } else {
            tx = await contracts.lendingPool.repay(asset.address, amountWei);
          }
          break;

        default:
          throw new Error('Invalid action');
      }

      // Wait for transaction confirmation
      await tx.wait();
      
      // Reset form and trigger refresh
      setAmount('');
      onTransactionComplete();

    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const actionConfig = {
    supply: {
      title: 'Supply Assets',
      description: 'Supply assets to earn interest',
      buttonText: 'Supply',
      buttonColor: 'btn-primary',
      icon: PlusIcon,
    },
    withdraw: {
      title: 'Withdraw Assets',
      description: 'Withdraw your supplied assets',
      buttonText: 'Withdraw',
      buttonColor: 'btn-secondary',
      icon: MinusIcon,
    },
    borrow: {
      title: 'Borrow Assets',
      description: 'Borrow against your collateral',
      buttonText: 'Borrow',
      buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
      icon: ArrowRightIcon,
    },
    repay: {
      title: 'Repay Loan',
      description: 'Repay your borrowed assets',
      buttonText: 'Repay',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
      icon: MinusIcon,
    },
  };

  const currentConfig = actionConfig[action];
  const IconComponent = currentConfig.icon;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <IconComponent className="h-6 w-6" />
        {currentConfig.title}
      </h2>
      
      <p className="text-gray-600 mb-6">{currentConfig.description}</p>

      {/* Action Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {Object.entries(actionConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setAction(key as ActionType)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              action === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {config.buttonText}
          </button>
        ))}
      </div>

      {/* Asset Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Asset
        </label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value as keyof typeof ASSETS)}
          className="input-field"
        >
          {Object.entries(ASSETS).map(([key, asset]) => (
            <option key={key} value={key}>
              {asset.symbol} - {asset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="input-field pr-16"
            step="any"
            min="0"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {ASSETS[selectedAsset].symbol}
          </div>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-2">
          {['25%', '50%', '75%', 'Max'].map((percentage) => (
            <button
              key={percentage}
              onClick={() => {
                // This would need actual balance data to work properly
                // For now, just placeholder
                const mockAmount = percentage === 'Max' ? '100' : 
                                 percentage === '75%' ? '75' :
                                 percentage === '50%' ? '50' : '25';
                setAmount(mockAmount);
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              {percentage}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Summary */}
      {amount && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Transaction Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Action:</span>
              <span className="font-medium capitalize">{action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Asset:</span>
              <span className="font-medium">{ASSETS[selectedAsset].symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{amount} {ASSETS[selectedAsset].symbol}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleTransaction}
        disabled={!amount || loading || !userAddress}
        className={`w-full ${currentConfig.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Processing...
          </>
        ) : (
          <>
            <IconComponent className="h-4 w-4" />
            {currentConfig.buttonText} {amount && `${amount} ${ASSETS[selectedAsset].symbol}`}
          </>
        )}
      </button>

      {/* Wallet Connection Notice */}
      {!userAddress && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Please connect your wallet to use lending features
        </div>
      )}
    </div>
  );
};