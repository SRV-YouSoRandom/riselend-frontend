import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';

export const useHealthFactor = (
  provider: ethers.providers.Web3Provider | null,
  signer: ethers.Signer | null,
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
      const healthFactorNumber = parseFloat(ethers.utils.formatEther(hf));
      
      // Get borrowing power
      const [totalBorrowingPower, totalBorrowsValue] = await contracts.lendingPool.getAccountBorrowingPower(userAddress);
      const borrowingPowerUSD = parseFloat(ethers.utils.formatEther(totalBorrowingPower));
      const totalBorrowsUSD = parseFloat(ethers.utils.formatEther(totalBorrowsValue));

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