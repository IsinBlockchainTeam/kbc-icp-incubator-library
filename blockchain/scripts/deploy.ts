// eslint-disable-next-line import/no-extraneous-dependencies
import hre, { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import { ContractName } from '../utils/constants';

dotenv.config({ path: '../.env' });

const contractMap = new Map<string, Contract>();

const serial = (funcs: Function[]) => funcs.reduce((promise: Promise<any>, func: Function) => promise.then((result: any) => func()
    .then(Array.prototype.concat.bind(result))), Promise.resolve([]));

async function deploy(contractName: string, contractArgs?: any[], contractAliasName?: string): Promise<void> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...(contractArgs || []));
    await contract.deployed();

    contractMap.set(contractAliasName || contractName, contract);

    console.log(`New ${contractAliasName || contractName} contract deployed, address ${contract.address}`);

    await hre.ethernal.push({
        name: contractName,
        address: contract.address,
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
serial([
    () => hre.ethernal.resetWorkspace(process.env.ETHERNAL_WORKSPACE || ''),
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableFiatManager'),
    async () => {
        const enums: string[] = ['USD', 'EUR', 'CHF'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableFiatManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableProductCategoryManager'),
    async () => {
        const enums: string[] = ['Arabic 85', 'Excelsa 88', 'Arabic 85 Superior', 'Liberica 85', 'Robusta 87'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableProductCategoryManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableTransactionTypeManager'),
    async () => {
        const enums: string[] = ['trade', 'transformation', 'certification'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableTransactionTypeManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.DOCUMENT_MANAGER, [
        [process.env.SUPPLIER_ADMIN],
        contractMap.get('EnumerableTransactionTypeManager')?.address,
    ],
    ),
    () => deploy(
        ContractName.ESCROW_MANAGER, [
            [process.env.SUPPLIER_ADMIN],
            process.env.COMMISSIONER_ADMIN,
        ],
    ),
    () => deploy(
        ContractName.TRADE_MANAGER, [
            [process.env.SUPPLIER_ADMIN, process.env.CUSTOMER_ADMIN],
            contractMap.get('EnumerableFiatManager')?.address,
            contractMap.get('EnumerableProductCategoryManager')?.address,
            contractMap.get(ContractName.DOCUMENT_MANAGER)?.address,
            contractMap.get(ContractName.ESCROW_MANAGER)?.address,
        ],
    ),
    () => deploy(
        ContractName.MATERIAL_MANAGER, [
            [process.env.SUPPLIER_ADMIN],
        ],
    ),
    () => deploy(ContractName.RELATIONSHIP_MANAGER, [
        [process.env.SUPPLIER_ADMIN],
    ]),
    () => deploy(
        ContractName.TRANSFORMATION_MANAGER, [
            [process.env.SUPPLIER_ADMIN],
            contractMap.get(ContractName.MATERIAL_MANAGER)?.address,
        ],
    ),
    () => deploy(
        ContractName.OFFER_MANAGER, [
            [process.env.SUPPLIER_ADMIN],
            contractMap.get('EnumerableProductCategoryManager')?.address,
        ],
    ),
])
    .catch((error: any) => {
        console.error(error);
        process.exitCode = 1;
    });
