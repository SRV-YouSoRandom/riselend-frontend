import { Contract, BrowserProvider, type Signer } from 'ethers';
import { useMemo } from 'react';
import { CONTRACTS } from '../contracts/addresses';

// Import your ABI files here
import LendingPoolABI from '../contracts/abis/LendingPool.json';
import LendingPoolCoreABI from '../contracts/abis/LendingPoolCore.json';
import PriceOracleABI from '../contracts/abis/PriceOracle.json';
import ProtocolConfiguratorABI from '../contracts/abis/ProtocolConfigurator.json';
import RewardsControllerABI from '../contracts/abis/RewardsController.json';
import RiseLendTokenABI from '../contracts/abis/RiseLendToken.json';

export const useContract = (provider: BrowserProvider | null, signer: Signer | null) => {
  return useMemo(() => {
    if (!provider || !signer) return null;

    return {
      lendingPool: new Contract(
        CONTRACTS.LENDING_POOL,
        LendingPoolABI,
        signer
      ),
      lendingPoolCore: new Contract(
        CONTRACTS.LENDING_POOL_CORE,
        LendingPoolCoreABI,
        provider
      ),
      priceOracle: new Contract(
        CONTRACTS.PRICE_ORACLE,
        PriceOracleABI,
        provider
      ),
      protocolConfigurator: new Contract(
        CONTRACTS.PROTOCOL_CONFIGURATOR,
        ProtocolConfiguratorABI,
        provider
      ),
      rewardsController: new Contract(
        CONTRACTS.REWARDS_CONTROLLER,
        RewardsControllerABI,
        provider
      ),
      riseLendToken: new Contract(
        CONTRACTS.RISE_LEND_TOKEN,
        RiseLendTokenABI,
        signer
      ),
    };
  }, [provider, signer]);
};