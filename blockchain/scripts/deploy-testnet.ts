/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import { ContractName } from '../utils/constants';

dotenv.config({ path: '../.env' });

const serial = (funcs: Function[]) =>
    funcs.reduce(
        (promise: Promise<any>, func: Function) => promise.then((result: any) => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
    );

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
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, '0x4788F5a460A4b27Cd90fC9F155164Be1eD39F729');
    //         const tx = await contract.add(enums[i]);
    //         await tx.wait();
    //     }
    // },
    // () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableProcessTypeManager'),
    // async () => {
    //     const enums: string[] = ['33 - Collecting', '38 - Harvesting'];
    //     for (let i = 0; i < enums.length; i++) {
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, '0x4eC8bC43bBb2103dAEf4c27cA5249BAF248CcfEe');
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
    // () => deploy(ContractName.REVOCATION_REGISTRY, [])
    // () =>
    //     deploy(ContractName.DELEGATE_MANAGER, [
    //         'KBC Delegate Manager',
    //         '1.0.1',
    //         222,
    //         '0xF3082fe94088724aFA92c23052a35dcC65A9FB88' // RevocationRegistry
    //     ])
    () =>
        deploy(
            ContractName.PRODUCT_CATEGORY_MANAGER,
            ['0xcc532211B2019a41c996dFF910e66242339Ae27A'] // DelegateManager
        )
    // () => deploy(ContractName.ENUMERABLE_TYPE_MANAGER, [[]], 'EnumerableUnitManager'),
    // async () => {
    //     const enums: string[] = ['BG - Bags', 'KGM - Kilograms', 'H87 - Pieces'];
    //     for (let i = 0; i < enums.length; i++) {
    //         const contract = await getAttachedContract(ContractName.ENUMERABLE_TYPE_MANAGER, ''); // TODO: da aggiornare con EnumerableUnitManager address
    //         const tx = await contract.add(enums[i]);
    //         await tx.wait();
    //     }
    // },
    // () =>
    //     deploy(ContractName.MATERIAL_MANAGER, [
    //         '0x015413b099806c9a8B7C6d9b8D6Aaa9EAd3d5A7A', // DelegateManager
    //         '0x00A06eCE165D5Dee726c5E156A1073B6ecAE504D' // ProductCategoryManager
    //     ])
    // () =>
    //     deploy(ContractName.DOCUMENT_MANAGER, [
    //         '0x9169B151C0C32c6Ab49Aa2A55a8a6c07aB04f1bb', // DelegateManager
    //         []
    //     ]),
    // () =>
    //     deploy(ContractName.ESCROW_MANAGER, [
    //         '0x9169B151C0C32c6Ab49Aa2A55a8a6c07aB04f1bb', // DelegateManager
    //         '0x30054880e4E2fA1082C1976cA5547cC3bd185c11', // ContractsOwner
    //         process.env.ESCROW_BASE_FEE || 20,
    //         process.env.ESCROW_COMMISSIONER_FEE || 1
    //     ]),
    // () =>
    //     deploy(ContractName.TRADE_MANAGER, [
    //         '0x9169B151C0C32c6Ab49Aa2A55a8a6c07aB04f1bb', // DelegateManager
    //         '0x705321A0E87a6E952712374302E8bDe3623B60b9', // ProductCategoryManager
    //         '0x7E4aaaE2258a677Cb706fb8a276e26700b92366C', // MaterialManager
    //         '0xd159C2E2a170131b0dB6E0304524db4c5AFBc847', // DocumentManager
    //         '0x52A45e1bfAd77E396B7c5180E499B69fA5BB93b8', // EnumerableFiatManager
    //         '0x108a6ea0280500f7Ddf6434864B4124cdFd88D4C', // EnumerableUnitManager
    //         '0x8AA99940F4234BEBF764515bF80fE822e1E17B12' // EscrowManager
    //     ]),
    // () =>
    //     deploy(ContractName.RELATIONSHIP_MANAGER, [
    //         '0x9169B151C0C32c6Ab49Aa2A55a8a6c07aB04f1bb', // DelegateManager
    //         ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'] // ContractsOwner
    //     ])
    // () =>
    //     deploy(ContractName.ASSET_OPERATION_MANAGER, [
    //         '0x037444C45ce591C7d9c598E49C5ED3AA1f8f4e3f', // DelegateManager
    //         '0x7E4aaaE2258a677Cb706fb8a276e26700b92366C', // MaterialManager
    //         '0xb8e699A624963AAcdfe793cE4bbCE856Dcd67eB0' // EnumerableProcessTypeManager
    //     ])
    // () =>
    //     deploy(ContractName.OFFER_MANAGER, [
    //         '0x9169B151C0C32c6Ab49Aa2A55a8a6c07aB04f1bb', // DelegateManager
    //         ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'], // ContractsOwner
    //         '0x705321A0E87a6E952712374302E8bDe3623B60b9' // ProductCategoryManager
    //     ])
    // () => deploy(
    //     ContractName.MY_TOKEN, [10000],
    // ),
    // () => deploy(ContractName.ETHEREUM_DID_REGISTRY, [])
    // () => deploy(
    //     ContractName.ESCROW, [
    //         '0x30054880e4E2fA1082C1976cA5547cC3bd185c11', // ContractsOwner
    //         '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123', // payee
    //         50000000,
    //         '0x4D559cDf9e7C2C2D51a8a0e0dD5DA583caC673BF', // tokenAddress
    //         '0x30054880e4E2fA1082C1976cA5547cC3bd185c11',
    //         process.env.ESCROW_BASE_FEE || 20,
    //         process.env.ESCROW_COMMISSIONER_FEE || 1
    //     ]
    // ),
    // async () => {
    //     const contract = await getAttachedContract(ContractName.MY_TOKEN, '0x4D559cDf9e7C2C2D51a8a0e0dD5DA583caC673BF');
    //     const tx = await contract.transfer('0xa1f48005f183780092E0E277B282dC1934AE3308', 50);
    //     await tx.wait();
    // }
]).catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
});
