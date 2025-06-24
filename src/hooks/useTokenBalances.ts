import { useState, useEffect } from 'react';
import { BrowserProvider, type Signer, formatUnits, Contract } from 'ethers';
import { ASSETS } from '../contracts/addresses';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

export interface TokenBalance {
  symbol: string;
  balance: string;
  balanceWei: string;
  decimals: number;
}

export const useTokenBalances = (
  provider: BrowserProvider | null,
  userAddress: string | null
) => {
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!provider || !userAddress) return;

    setLoading(true);
    setError(null);

    try {
      const balanceData: Record<string, TokenBalance> = {};

      for (const [key, asset] of Object.entries(ASSETS)) {
        try {
          let balance: bigint;
          
          if (asset.symbol === 'ETH') {
            // Get ETH balance
            balance = await provider.getBalance(userAddress);
          } else {
            // Get ERC20 token balance
            const tokenContract = new Contract(asset.address, ERC20_ABI, provider);
            balance = await tokenContract.balanceOf(userAddress);
          }

          const balanceFormatted = formatUnits(balance, asset.decimals);

          balanceData[key] = {
            symbol: asset.symbol,
            balance: balanceFormatted,
            balanceWei: balance.toString(),
            decimals: asset.decimals,
          };
        } catch (err) {
          console.error(`Error fetching balance for ${asset.symbol}:`, err);
          balanceData[key] = {
            symbol: asset.symbol,
            balance: '0',
            balanceWei: '0',
            decimals: asset.decimals,
          };
        }
      }

      setBalances(balanceData);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress && provider) {
      fetchBalances();
    } else {
      setBalances({});
    }
  }, [userAddress, provider]);

  return { balances, loading, error, refetch: fetchBalances };
};