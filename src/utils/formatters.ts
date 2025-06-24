import { ethers } from 'ethers';

export const formatBalance = (balance: string | number, decimals = 18, displayDecimals = 4): string => {
  try {
    const formatted = ethers.utils.formatUnits(balance.toString(), decimals);
    const num = parseFloat(formatted);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    });
  } catch (error) {
    return '0';
  }
};

export const formatUSD = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount < 0.01) return '< $0.01';
  
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const parseInputAmount = (input: string, decimals = 18): string => {
  try {
    if (!input || input === '') return '0';
    return ethers.utils.parseUnits(input, decimals).toString();
  } catch (error) {
    throw new Error('Invalid amount');
  }
};

export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const getHealthFactorColor = (healthFactor: number): string => {
  if (healthFactor >= 2) return 'text-success-600';
  if (healthFactor >= 1.5) return 'text-yellow-600';
  if (healthFactor >= 1.2) return 'text-orange-600';
  return 'text-danger-600';
};

export const getHealthFactorStatus = (healthFactor: number): string => {
  if (healthFactor >= 2) return 'Safe';
  if (healthFactor >= 1.5) return 'Good';
  if (healthFactor >= 1.2) return 'Risky';
  return 'Danger';
};