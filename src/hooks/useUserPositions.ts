import { useState, useEffect } from 'react';
import { BrowserProvider, type Signer, formatUnits } from 'ethers';
import { useContract } from './useContract';
import { ASSETS } from '../contracts/addresses';
import { formatBalance } from '../utils/formatters';

export interface UserPosition {
  asset: string;
  symbol: string;
  supplied: string;
  borrowed: string;
  suppliedUSD: number;
  borrowedUSD: number;
}

export const useUserPositions = (
  provider: BrowserProvider | null,
  signer: Signer | null,
  userAddress: string | null
) => {
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const contracts = useContract(provider, signer);

  const fetchPositions = async () => {
    if (!contracts || !userAddress) return;

    setLoading(true);
    setError(null);

    try {
      const positionsData: UserPosition[] = [];

      for (const [key, asset] of Object.entries(ASSETS)) {
        try {
          // Get user position
          const position = await contracts.lendingPoolCore.userPositions(userAddress, asset.address);
          
          // Get asset price
          const price = await contracts.priceOracle.getAssetPrice(asset.address);
          const priceNumber = parseFloat(formatUnits(price, 8)); // Assuming 8 decimals for price

          // Format amounts
          const suppliedFormatted = formatBalance(position.suppliedAmount, asset.decimals);
          const borrowedFormatted = formatBalance(position.borrowedAmount, asset.decimals);
          
          // Calculate USD values
          const suppliedUSD = parseFloat(suppliedFormatted) * priceNumber;
          const borrowedUSD = parseFloat(borrowedFormatted) * priceNumber;

          positionsData.push({
            asset: asset.address,
            symbol: asset.symbol,
            supplied: suppliedFormatted,
            borrowed: borrowedFormatted,
            suppliedUSD,
            borrowedUSD,
          });
        } catch (err) {
          console.error(`Error fetching position for ${asset.symbol}:`, err);
        }
      }

      setPositions(positionsData);
    } catch (err) {
      console.error('Error fetching user positions:', err);
      setError('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress && contracts) {
      fetchPositions();
    }
  }, [userAddress, contracts]);

  return { positions, loading, error, refetch: fetchPositions };
};