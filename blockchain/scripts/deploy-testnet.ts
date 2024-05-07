/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import { ContractName } from '../utils/constants';

dotenv.config({ path: '../.env' });

const serial = (funcs: Function[]) => funcs.reduce((promise: Promise<any>, func: Function) => promise.then((result: any) => func()
    .then(Array.prototype.concat.bind(result))), Promise.resolve([]));

async function deploy(contractName: string, contractArgs?: any[], contractAliasName?: string): Promise<void> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...(contractArgs || []));
    await contract.deployed();
    console.log(`New ${contractAliasName || contractName} contract deployed, address ${contract.address}`);
}

async function getAttachedContract(contractName: string, contractAddress: string): Promise<Contract> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    return ContractFactory.attach(contractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
serial([
    // () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableFiatManager'),
    // async () => {
    //     const enums: string[] = ['USD', 'EUR', 'CHF'];
    //     for (let i = 0; i < enums.length; i++) {
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, '0x5FbDB2315678afecb367f032d93F642f64180aa3');
    //         const tx = await contract.add(enums[i]);
    //         await tx.wait();
    //     }
    // },
    // () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableProcessTypeManager'),
    // async () => {
    //     const enums: string[] = ['33 - Collecting', '38 - Harvesting'];
    //     for (let i = 0; i < enums.length; i++) {
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9');
    //         const tx = await contract.add(enums[i]);
    //         await tx.wait();
    //     }
    // },
    // () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableAssessmentStandardManager'),
    // async () => {
    //     const enums: string[] = ['Chemical use assessment', 'Environment assessment', 'Origin assessment', 'Quality assessment', 'Swiss Decode'];
    //     for (let i = 0; i < enums.length; i++) {
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, '0xE7Ebdf855cfE97b9176A858C4a5293da7C58894b');
    //         const tx = await contract.add(enums[i]);
    //         await tx.wait();
    //     }
    // },
    // () => deploy(
    //     ContractName.PRODUCT_CATEGORY_MANAGER, [],
    // ),
    // () => deploy(
    //     ContractName.MATERIAL_MANAGER, ['0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE'], // ProductCategoryManager
    // ),
    // () => deploy(
    //     ContractName.DOCUMENT_MANAGER, [[]],
    // ),
    // () => deploy(
    //     ContractName.ESCROW_MANAGER, [
    //         '0x30054880e4E2fA1082C1976cA5547cC3bd185c11', // ContractsOwner
    //         process.env.ESCROW_BASE_FEE || 20,
    //         process.env.ESCROW_COMMISSIONER_FEE || 1,
    //     ],
    // ),
    () => deploy(
        ContractName.TRADE_MANAGER, [
            '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE', // PRODUCT_CATEGORY_MANAGER
            '0x68B1D87F95878fE05B998F19b66F4baba5De1aed', // MATERIAL_MANAGER
            '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c', // DOCUMENT_MANAGER
            '0x5FbDB2315678afecb367f032d93F642f64180aa3', // EnumerableFiatManager
            '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82', // EnumerableUnitManager
            '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d', // ESCROW_MANAGER
        ],
    ),
    // () => deploy(ContractName.RELATIONSHIP_MANAGER, [
    //     ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'], // ContractsOwner
    // ]),
    // () => deploy(
    //     ContractName.ASSET_OPERATION_MANAGER, [
    //         '0x68B1D87F95878fE05B998F19b66F4baba5De1aed', // MaterialManager
    //         '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', // EnumerableProcessTypeManager
    //     ],
    // ),
    // () => deploy(
    //     ContractName.OFFER_MANAGER, [
    //         ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'], // ContractsOwner
    //         '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE', // ProductCategoryManager
    //     ],
    // ),
    // () => deploy(
    //     ContractName.MY_TOKEN, [10000],
    // ),
    // () => deploy(
    //     ContractName.ETHEREUM_DID_REGISTRY, [],
    // ),
])
    .catch((error: any) => {
        console.error(error);
        process.exitCode = 1;
    });
