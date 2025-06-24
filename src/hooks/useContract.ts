import { ethers } from 'ethers';
import { useMemo } from 'react';
import { CONTRACTS } from '../contracts/addresses';

// Import your ABI files here
// Copy your ABI JSON files to src/contracts/abis/ folder
import LendingPoolABI from '../contracts/abis/LendingPool.json';
import LendingPoolCoreABI from '../contracts/abis/LendingPoolCore.json';
import PriceOracleABI from '../contracts/abis/PriceOracle.json';
import ProtocolConfiguratorABI from '../contracts/abis/ProtocolConfigurator.json';
import RewardsControllerABI from '../contracts/abis/RewardsController.json';
import RiseLendTokenABI from '../contracts/abis/RiseLendToken.json';

export const useContract = (provider: ethers.providers.Web3Provider | null, signer: ethers.Signer | null) => {
  return useMemo(() => {
    if (!provider || !signer) return null;

    return {
      lendingPool: new ethers.Contract(
        CONTRACTS.LENDING_POOL,
        LendingPoolABI,
        signer
      ),
      lendingPoolCore: new ethers.Contract(
        CONTRACTS.LENDING_POOL_CORE,
        LendingPoolCoreABI,
        provider
      ),
      priceOracle: new ethers.Contract(
        CONTRACTS.PRICE_ORACLE,
        PriceOracleABI,
        provider
      ),
      protocolConfigurator: new ethers.Contract(
        CONTRACTS.PROTOCOL_CONFIGURATOR,
        ProtocolConfiguratorABI,
        provider
      ),
      rewardsController: new ethers.Contract(
        CONTRACTS.REWARDS_CONTROLLER,
        RewardsControllerABI,
        provider
      ),
      riseLendToken: new ethers.Contract(
        CONTRACTS.RISE_LEND_TOKEN,
        RiseLendTokenABI,
        signer
      ),
    };
  }, [provider, signer]);
};