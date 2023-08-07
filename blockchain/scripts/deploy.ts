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
        const enums: string[] = ['CategoryA', 'CategoryB', 'CategoryA Superior'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableProductCategoryManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(
        ContractName.CONTRACT_MANAGER,
        [[process.env.SUPPLIER_ADMIN || '', process.env.CUSTOMER_ADMIN || ''],
            contractMap.get('EnumerableFiatManager')?.address,
            contractMap.get('EnumerableProductCategoryManager')?.address],
    ),
    () => deploy(
        ContractName.ORDER_MANAGER,
        [[process.env.SUPPLIER_ADMIN || '', process.env.CUSTOMER_ADMIN || ''],
            contractMap.get(ContractName.CONTRACT_MANAGER)?.address],
    ),
    () => deploy(
        ContractName.SUPPLY_CHAIN_MANAGER,
        [],
    ),
])
    .catch((error: any) => {
        console.error(error);
        process.exitCode = 1;
    });
