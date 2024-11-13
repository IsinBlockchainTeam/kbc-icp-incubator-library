import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

require('@openzeppelin/hardhat-upgrades');

dotenv.config();

const { PRIVATE_KEY, DEFAULT_DEPLOY_NETWORK, NODE_ENV, RPC_URL } = process.env;

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
    defaultNetwork: NODE_ENV === 'test' ? 'hardhat' : DEFAULT_DEPLOY_NETWORK,
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true
        },
        testnet: {
            url: RPC_URL || '',
            accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : []
        },
        sepolia: {
            chainId: 11155111,
            url: 'https://sepolia.infura.io/v3/14bc392775034b3d80988f5211a95985',
            accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : []
        },
        threeachain: {
            chainId: 222,
            url: RPC_URL || '',
            accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : []
        },
        holesky: {
            chainId: 17000,
            url: 'https://1rpc.io/holesky',
            accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : []
        }
    },
    // @ts-ignore
    typechain: {
        // outDir: '../src/smart-contracts',
        target: 'ethers-v5'
    }
};

export default config;
