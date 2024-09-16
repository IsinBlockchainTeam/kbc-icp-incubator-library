/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import {Libraries} from "@nomiclabs/hardhat-ethers/types";
import { ContractName } from '../utils/constants';

dotenv.config({ path: '../.env' });

const contractMap = new Map<string, Contract>();

const serial = (funcs: Function[]) =>
    funcs.reduce(
        (promise: Promise<any>, func: Function) => promise.then((result: any) => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
    );

async function getAttachedContract(contractName: string, contractAddress: string): Promise<Contract> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    return ContractFactory.attach(contractAddress);
}

async function deploy(contractName: string, contractArgs?: any[], contractAliasName?: string, libraries?: Libraries): Promise<void> {
    const ContractFactory = await ethers.getContractFactory(contractName,
        {
            libraries
        }
    );
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
    () => deploy(ContractName.DELEGATE_MANAGER, ['KBC Delegate Manager', '1.0.1', 31337, contractMap.get(ContractName.REVOCATION_REGISTRY)!.address]),
    () => deploy(ContractName.PRODUCT_CATEGORY_MANAGER, [contractMap.get(ContractName.DELEGATE_MANAGER)!.address]),
    () =>
        deploy(ContractName.MATERIAL_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address
        ]),
    () => deploy(ContractName.DOCUMENT_MANAGER, [contractMap.get(ContractName.DELEGATE_MANAGER)!.address, [process.env.SUPPLIER_ADMIN || '']]),
    () =>
        deploy(ContractName.ESCROW_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            process.env.COMMISSIONER_ADMIN || '',
            process.env.ESCROW_BASE_FEE || 20,
            process.env.ESCROW_COMMISSIONER_FEE || 1
        ]),
    () =>
        deploy(ContractName.KBC_SHIPMENT_LIBRARY),
    () =>
        deploy(ContractName.TRADE_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address,
            contractMap.get(ContractName.MATERIAL_MANAGER)!.address,
            contractMap.get(ContractName.DOCUMENT_MANAGER)!.address,
            contractMap.get('EnumerableFiatManager')!.address,
            contractMap.get('EnumerableUnitManager')!.address,
            contractMap.get(ContractName.ESCROW_MANAGER)!.address
        ], undefined, {
            KBCShipmentLibrary: contractMap.get(ContractName.KBC_SHIPMENT_LIBRARY)!.address
        }),
    () => deploy(ContractName.RELATIONSHIP_MANAGER, [contractMap.get(ContractName.DELEGATE_MANAGER)!.address, [process.env.SUPPLIER_ADMIN || '']]),
    () =>
        deploy(ContractName.ASSET_OPERATION_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            contractMap.get(ContractName.MATERIAL_MANAGER)!.address,
            contractMap.get('EnumerableProcessTypeManager')!.address
        ]),
    () =>
        deploy(ContractName.OFFER_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            [process.env.SUPPLIER_ADMIN || ''],
            contractMap.get(ContractName.PRODUCT_CATEGORY_MANAGER)!.address
        ]),
    () => deploy(ContractName.MY_TOKEN, [10000]),
    () => deploy(ContractName.ETHEREUM_DID_REGISTRY, []),
    () =>
        deploy(ContractName.CERTIFICATE_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            contractMap.get('EnumerableProcessTypeManager')!.address,
            contractMap.get('EnumerableAssessmentStandardManager')!.address,
            contractMap.get(ContractName.DOCUMENT_MANAGER)!.address,
            contractMap.get(ContractName.MATERIAL_MANAGER)!.address
        ]),
]).catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
});
