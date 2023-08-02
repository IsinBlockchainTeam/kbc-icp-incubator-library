import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-ethernal';

require('@openzeppelin/hardhat-upgrades');

dotenv.config();

const {
    PRIVATE_KEY,
    DEFAULT_DEPLOY_NETWORK,
    SEPOLIA_API_URL,
    ETHERNAL_EMAIL,
    NODE_ENV,
} = process.env;

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
                details: {
                    yul: true,
                },
            },
            viaIR: true,
        },
    },
    defaultNetwork: DEFAULT_DEPLOY_NETWORK || 'localhost',
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        sepolia: {
            url: SEPOLIA_API_URL || '',
            accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
        },
    },
    // @ts-ignore
    typechain: {
        // outDir: '../src/smart-contracts',
        target: 'ethers-v5',
    },
    ethernal: {
        disableSync: false, // If set to true, plugin will not sync blocks & txs
        disableTrace: false, // If set to true, plugin won't trace transaction
        workspace: undefined, // Set the workspace to use, will default to the default workspace (latest one used in the dashboard). It is also possible to set it through the ETHERNAL_WORKSPACE env variable
        uploadAst: true, // If set to true, plugin will upload AST, and you'll be able to use the storage feature (longer sync time though)
        disabled: !ETHERNAL_EMAIL || NODE_ENV === 'test', // If set to true, the plugin will be disabled, nohting will be synced, ethernal.push won't do anything either
        resetOnStart: undefined, // Pass a workspace name to reset it automatically when restarting the node, note that if the workspace doesn't exist it won't error
        serverSync: false, // Only available on public explorer plans - If set to true, blocks & txs will be synced by the server. For this to work, your chain needs to be accessible from the internet. Also, trace won't be synced for now when this is enabled.
        skipFirstBlock: false, // If set to true, the first block will be skipped. This is mostly useful to avoid having the first block synced with its tx when starting a mainnet fork
        verbose: false, // If set to true, will display this config object on start and the full error object
    },
};

export default config;
