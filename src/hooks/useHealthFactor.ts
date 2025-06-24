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
      
      // Handle the health factor calculation properly
      let healthFactorNumber: number;
      
      // Convert to string first to handle very large numbers
      const hfString = hf.toString();
      
      // If the health factor is extremely large, treat it as infinity (no debt)
      if (hfString.length > 20) {
        healthFactorNumber = Infinity;
      } else {
        healthFactorNumber = parseFloat(formatUnits(hf, 18));
        
        // If still extremely large after formatting, set to infinity
        if (healthFactorNumber > 1e10) {
          healthFactorNumber = Infinity;
        }
      }
      
      // Get borrowing power and total borrows
      const [totalBorrowingPower, totalBorrowsValue] = await contracts.lendingPool.getAccountBorrowingPower(userAddress);
      const borrowingPowerUSD = parseFloat(formatUnits(totalBorrowingPower, 18));
      const totalBorrowsUSD = parseFloat(formatUnits(totalBorrowsValue, 18));

      setHealthFactor(healthFactorNumber);
      setBorrowingPower(borrowingPowerUSD);
      setTotalBorrows(totalBorrowsUSD);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data');
      
      // Set default values on error
      setHealthFactor(Infinity);
      setBorrowingPower(0);
      setTotalBorrows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress && contracts) {
      fetchHealthData();
    } else {
      // Reset values when wallet disconnected
      setHealthFactor(0);
      setBorrowingPower(0);
      setTotalBorrows(0);
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