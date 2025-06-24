import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatUnits, Contract } from 'ethers';
import { ASSETS } from '../contracts/addresses';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
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

  const fetchBalances = useCallback(async () => {
    if (!provider || !userAddress) {
      console.log('Provider or userAddress missing:', { provider: !!provider, userAddress });
      setBalances({});
      return;
    }

    console.log('Fetching balances for:', userAddress);
    setLoading(true);
    setError(null);

    try {
      const balanceData: Record<string, TokenBalance> = {};

      for (const [key, asset] of Object.entries(ASSETS)) {
        try {
          console.log(`Fetching balance for ${asset.symbol} (${asset.address})`);
          
          let balance: bigint;
          
          if (asset.symbol === 'ETH') {
            // Get ETH balance
            balance = await provider.getBalance(userAddress);
            console.log(`ETH balance (wei):`, balance.toString());
          } else {
            // Get ERC20 token balance
            const tokenContract = new Contract(asset.address, ERC20_ABI, provider);
            
            // Verify contract exists
            const code = await provider.getCode(asset.address);
            if (code === '0x') {
              console.warn(`No contract found at ${asset.address} for ${asset.symbol}`);
              balance = 0n;
            } else {
              balance = await tokenContract.balanceOf(userAddress);
              console.log(`${asset.symbol} balance (wei):`, balance.toString());
            }
          }

          const balanceFormatted = formatUnits(balance, asset.decimals);
          console.log(`${asset.symbol} balance (formatted):`, balanceFormatted);

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

      console.log('Final balance data:', balanceData);
      setBalances(balanceData);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to load balances');
      // Set empty balances on error
      const emptyBalances: Record<string, TokenBalance> = {};
      Object.entries(ASSETS).forEach(([key, asset]) => {
        emptyBalances[key] = {
          symbol: asset.symbol,
          balance: '0',
          balanceWei: '0',
          decimals: asset.decimals,
        };
      });
      setBalances(emptyBalances);
    } finally {
      setLoading(false);
    }
  }, [provider, userAddress]);

  // Fetch balances when dependencies change
  useEffect(() => {
    if (userAddress && provider) {
      fetchBalances();
    } else {
      setBalances({});
    }
  }, [userAddress, provider, fetchBalances]);

  // Auto-refresh balances every 30 seconds when connected
  useEffect(() => {
    if (!userAddress || !provider) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing balances...');
      fetchBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [userAddress, provider, fetchBalances]);

  return { balances, loading, error, refetch: fetchBalances };
};