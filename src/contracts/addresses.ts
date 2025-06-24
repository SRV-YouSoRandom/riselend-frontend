// Contract addresses - Update these after deployment
export const CONTRACTS = {
  LENDING_POOL: '0x647A234234D51B530e85933B05817ef3505a8687', // Your LendingPool address
  LENDING_POOL_CORE: '0x4e1606cC4C83F5c092294948Fc1d909aa0417aB3', // Your LendingPoolCore address
  PRICE_ORACLE: '0xebFC1D20D272a9BD8F51f09dc281e3FB9c3bBA3e', // Your PriceOracle address
  PROTOCOL_CONFIGURATOR: '0x874f8DD69A324D89E685619563F9ABa71746a095', // Your ProtocolConfigurator address
  REWARDS_CONTROLLER: '0x466174D98BdBBF68e53e65c612a8388CD554C290', // Your RewardsController address
  RISE_LEND_TOKEN: '0xC3eEAb50BA07308ACEcF8c30C562b7f62A5D6b23', // Your RiseLendToken address
} as const;

// Supported assets
export const ASSETS = {
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849',
    decimals: 6,
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55',
    decimals: 8,
  },
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155931,
  name: 'Risechain Testnet',
  rpcUrl: 'https://testnet.riselabs.xyz',
};