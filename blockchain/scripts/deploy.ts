/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import { Libraries } from '@nomiclabs/hardhat-ethers/types';
import { ContractName } from '../constants/contracts';
import { getRequiredEnvs } from '../utils/env';

dotenv.config({ path: '../.env' });

const contractMap = new Map<string, Contract>();

const serial = (funcs: Function[]) =>
    funcs.reduce(
        (promise: Promise<any>, func: Function) => promise.then((result: any) => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
    );

async function deploy(contractName: string, contractArgs?: any[], contractAliasName?: string, libraries?: Libraries): Promise<void> {
    const ContractFactory = await ethers.getContractFactory(contractName, {
        libraries
    });
    const contract = await ContractFactory.deploy(...(contractArgs || []));
    await contract.deployed();

    contractMap.set(contractAliasName || contractName, contract);

    console.log(`New ${contractAliasName || contractName} contract deployed, address ${contract.address}`);
}

const env = getRequiredEnvs('ENTITY_MANAGER_CANISTER_ADDRESS', 'FEE_RECIPIENT_ADDRESS', 'DOWN_PAYMENT_BASE_FEE', 'DOWN_PAYMENT_COMMISSIONER_FEE');

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
serial([
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableFiatManager'),
    async () => {
        const enums: string[] = ['USD', 'EUR', 'CHF'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableFiatManager')?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableProcessTypeManager'),
    async () => {
        const enums: string[] = ['33 - Collecting', '38 - Harvesting'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableProcessTypeManager')?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableAssessmentStandardManager'),
    async () => {
        const enums: string[] = ['Chemical use assessment', 'Environment assessment', 'Origin assessment', 'Quality assessment', 'Swiss Decode'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableAssessmentStandardManager')?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableUnitManager'),
    async () => {
        const enums: string[] = ['BG - Bags', 'KGM - Kilograms', 'H87 - Pieces'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableUnitManager')?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.REVOCATION_REGISTRY, []),
    () =>
        deploy(ContractName.DOWN_PAYMENT_MANAGER, [
            env.ENTITY_MANAGER_CANISTER_ADDRESS,
            env.FEE_RECIPIENT_ADDRESS,
            env.DOWN_PAYMENT_BASE_FEE,
            env.DOWN_PAYMENT_COMMISSIONER_FEE
        ]),
    () => deploy(ContractName.MY_TOKEN, [10000]),
    () => deploy(ContractName.ETHEREUM_DID_REGISTRY, [])
]).catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
});
