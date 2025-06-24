import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatUSD, formatPercentage, getHealthFactorColor, getHealthFactorStatus } from '../utils/formatters';

interface RiskMetricsProps {
  healthFactor: number;
  borrowingPower: number;
  totalBorrows: number;
  loading: boolean;
}

export const RiskMetrics: React.FC<RiskMetricsProps> = ({
  healthFactor,
  borrowingPower,
  totalBorrows,
  loading,
}) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const utilizationRate = borrowingPower > 0 ? (totalBorrows / borrowingPower) * 100 : 0;
  const availableToBorrow = Math.max(0, borrowingPower - totalBorrows);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        {healthFactor >= 1.5 ? (
          <ShieldCheckIcon className="h-6 w-6 text-success-600" />
        ) : (
          <ExclamationTriangleIcon className="h-6 w-6 text-danger-600" />
        )}
        <h2 className="text-xl font-semibold">Risk Overview</h2>
      </div>

      <div className="space-y-6">
        {/* Health Factor */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Health Factor</span>
            <span className={`font-semibold ${getHealthFactorColor(healthFactor)}`}>
              {getHealthFactorStatus(healthFactor)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {healthFactor < 1 ? 'Liquidation Risk' : 'Safe'}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                healthFactor >= 2 ? 'bg-success-500' :
                healthFactor >= 1.5 ? 'bg-yellow-500' :
                healthFactor >= 1.2 ? 'bg-orange-500' : 'bg-danger-500'
              }`}
              style={{ 
                width: `${Math.min(100, (healthFactor / 3) * 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Borrowing Power */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600 block mb-1">
              Total Borrowing Power
            </span>
            <span className="text-lg font-semibold">
              {formatUSD(borrowingPower)}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 block mb-1">
              Available to Borrow
            </span>
            <span className="text-lg font-semibold text-success-600">
              {formatUSD(availableToBorrow)}
            </span>
          </div>
        </div>

        {/* Utilization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Borrow Utilization
            </span>
            <span className="text-sm font-semibold">
              {formatPercentage(utilizationRate)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilizationRate < 50 ? 'bg-success-500' :
                utilizationRate < 75 ? 'bg-yellow-500' :
                utilizationRate < 90 ? 'bg-orange-500' : 'bg-danger-500'
              }`}
              style={{ width: `${Math.min(100, utilizationRate)}%` }}
            ></div>
          </div>
        </div>

        {/* Risk Warning */}
        {healthFactor < 1.5 && healthFactor !== Infinity && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Risk Warning</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your health factor is low. Consider supplying more collateral or repaying debt to avoid liquidation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};