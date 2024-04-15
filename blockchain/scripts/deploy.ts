/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
serial([
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableFiatManager'),
    async () => {
        const enums: string[] = ['USD', 'EUR', 'CHF'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableFiatManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableProcessTypeManager'),
    async () => {
        const enums: string[] = ['33 - Collecting', '38 - Harvesting'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableProcessTypeManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableAssessmentStandardManager'),
    async () => {
        const enums: string[] = ['Chemical use assessment', 'Environment assessment', 'Origin assessment', 'Quality assessment', 'Swiss Decode'];
        for (let i = 0; i < enums.length; i++) {
            const tx = await contractMap.get('EnumerableAssessmentStandardManager')
                ?.add(enums[i]);
            await tx.wait();
        }
    },
    () => deploy(
        ContractName.PRODUCT_CATEGORY_MANAGER, [],
    ),
    () => deploy(
        ContractName.MATERIAL_MANAGER, [
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address,
        ],
    ),
    () => deploy(
        ContractName.DOCUMENT_MANAGER, [
            [process.env.SUPPLIER_ADMIN || ''],
        ],
    ),
    () => deploy(
        ContractName.ESCROW_MANAGER, [
            process.env.COMMISSIONER_ADMIN || '',
            process.env.ESCROW_BASE_FEE || 20,
            process.env.ESCROW_COMMISSIONER_FEE || 1,
        ],
    ),
    () => deploy(
        ContractName.TRADE_MANAGER, [
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address,
            contractMap.get(ContractName.MATERIAL_MANAGER)!.address,
            contractMap.get(ContractName.DOCUMENT_MANAGER)!.address,
            contractMap.get('EnumerableFiatManager')!.address,
            contractMap.get(ContractName.ESCROW_MANAGER)!.address,
        ],
    ),
    () => deploy(ContractName.RELATIONSHIP_MANAGER, [
        [process.env.SUPPLIER_ADMIN || ''],
    ]),
    () => deploy(
        ContractName.ASSET_OPERATION_MANAGER, [
            contractMap.get(ContractName.MATERIAL_MANAGER)!.address,
            contractMap.get('EnumerableProcessTypeManager')!.address,
        ],
    ),
    () => deploy(
        ContractName.OFFER_MANAGER, [
            [process.env.SUPPLIER_ADMIN || ''],
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address,
        ],
    ),
    () => deploy(
        ContractName.MY_TOKEN, [10000],
    ),
    () => deploy(
        ContractName.ETHEREUM_DID_REGISTRY, [],
    ),
])
    .catch((error: any) => {
        console.error(error);
        process.exitCode = 1;
    });
