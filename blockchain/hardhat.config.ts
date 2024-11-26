import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { getRequiredEnvs } from './utils/env';

require('@openzeppelin/hardhat-upgrades');
require('hardhat-dependency-compiler');

dotenv.config();

const env = getRequiredEnvs('DEPLOYER_PRIVATE_KEY', 'DEFAULT_DEPLOY_NETWORK', 'RPC_URL');

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
                details: {
                    yul: true
                }
            },
            viaIR: true
        }
    },
    // @ts-ignore
    dependencyCompiler: {
        paths: ['@blockchain-lib/blockchain-common/contracts/EnumerableType.sol']
    },
    defaultNetwork: process.env.NODE_ENV === 'test' ? 'hardhat' : env.DEFAULT_DEPLOY_NETWORK,
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true
        },
        threeachain: {
            chainId: 222,
            url: env.RPC_URL,
            accounts: env.DEPLOYER_PRIVATE_KEY ? [`0x${env.DEPLOYER_PRIVATE_KEY}`] : []
        },
        holesky: {
            chainId: 17000,
            url: 'https://1rpc.io/holesky',
            accounts: env.DEPLOYER_PRIVATE_KEY ? [`0x${env.DEPLOYER_PRIVATE_KEY}`] : []
        }
    },
    // @ts-ignore
    typechain: {
        // outDir: '../src/smart-contracts',
        target: 'ethers-v5'
    }
};

export default config;
