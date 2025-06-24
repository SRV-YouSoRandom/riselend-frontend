import React from 'react';
import { UserPosition } from '../hooks/useUserPositions';
import { formatBalance, formatUSD } from '../utils/formatters';

interface UserPositionsProps {
  positions: UserPosition[];
  loading: boolean;
}

export const UserPositions: React.FC<UserPositionsProps> = ({ positions, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePositions = positions.filter(
    (pos) => parseFloat(pos.supplied) > 0 || parseFloat(pos.borrowed) > 0
  );

  const totalSupplied = positions.reduce((sum, pos) => sum + pos.suppliedUSD, 0);
  const totalBorrowed = positions.reduce((sum, pos) => sum + pos.borrowedUSD, 0);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Your Positions</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm font-medium text-gray-600 block">Total Supplied