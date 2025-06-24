import React from 'react';
import type { UserPosition } from '../hooks/useUserPositions';
import { formatUSD } from '../utils/formatters';

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
          <span className="text-sm font-medium text-gray-600 block">Total Supplied</span>
          <span className="text-xl font-bold text-success-600">{formatUSD(totalSupplied)}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600 block">Total Borrowed</span>
          <span className="text-xl font-bold text-orange-600">{formatUSD(totalBorrowed)}</span>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-3">
        {activePositions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active positions</p>
            <p className="text-sm mt-1">Start by supplying assets to the protocol</p>
          </div>
        ) : (
          activePositions.map((position) => (
            <div
              key={position.asset}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {position.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{position.symbol}</p>
                  <p className="text-sm text-gray-500">
                    {position.symbol === 'USDT' ? 'Tether USD' : 
                     position.symbol === 'ETH' ? 'Ethereum' : 
                     position.symbol === 'BTC' ? 'Bitcoin' : position.symbol}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="space-y-1">
                  {parseFloat(position.supplied) > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Supplied</p>
                      <p className="font-semibold text-success-600">
                        {position.supplied} {position.symbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatUSD(position.suppliedUSD)}
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(position.borrowed) > 0 && (
                    <div className={parseFloat(position.supplied) > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
                      <p className="text-sm text-gray-600">Borrowed</p>
                      <p className="font-semibold text-orange-600">
                        {position.borrowed} {position.symbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatUSD(position.borrowedUSD)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* All Assets */}
      {activePositions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">All Assets</h3>
          <div className="grid grid-cols-1 gap-2">
            {positions.map((position) => (
              <div
                key={position.asset}
                className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {position.symbol.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{position.symbol}</span>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-gray-600">Supply</p>
                    <p className={parseFloat(position.supplied) > 0 ? 'text-success-600 font-medium' : 'text-gray-400'}>
                      {parseFloat(position.supplied) > 0 ? position.supplied : '0'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Borrow</p>
                    <p className={parseFloat(position.borrowed) > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                      {parseFloat(position.borrowed) > 0 ? position.borrowed : '0'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};