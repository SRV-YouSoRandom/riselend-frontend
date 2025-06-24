import { useState, useEffect } from 'react';
import { BrowserProvider, type Signer, formatUnits } from 'ethers';
import { useContract } from './useContract';

export const useHealthFactor = (
  provider: BrowserProvider | null,
  signer: Signer | null,
  userAddress: string | null
) => {
  const [healthFactor, setHealthFactor] = useState<number>(0);
  const [borrowingPower, setBorrowingPower] = useState<number>(0);
  const [totalBorrows, setTotalBorrows] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contracts = useContract(provider, signer);

  const fetchHealthData = async () => {
    if (!contracts || !userAddress) return;

    setLoading(true);
    setError(null);

    try {
      // Get health factor
      const hf = await contracts.lendingPool.getHealthFactor(userAddress);
      const healthFactorNumber = parseFloat(formatUnits(hf, 18));
      
      // Get borrowing power
      const [totalBorrowingPower, totalBorrowsValue] = await contracts.lendingPool.getAccountBorrowingPower(userAddress);
      const borrowingPowerUSD = parseFloat(formatUnits(totalBorrowingPower, 18));
      const totalBorrowsUSD = parseFloat(formatUnits(totalBorrowsValue, 18));

      setHealthFactor(healthFactorNumber);
      setBorrowingPower(borrowingPowerUSD);
      setTotalBorrows(totalBorrowsUSD);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress && contracts) {
      fetchHealthData();
    }
  }, [userAddress, contracts]);

  return { 
    healthFactor, 
    borrowingPower, 
    totalBorrows, 
    loading, 
    error, 
    refetch: fetchHealthData 
  };
};