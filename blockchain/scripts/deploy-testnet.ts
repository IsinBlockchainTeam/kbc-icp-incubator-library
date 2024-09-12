/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { Contract } from 'ethers';
import { ContractName } from '../utils/constants';
import { Libraries } from '@nomiclabs/hardhat-ethers/types';

dotenv.config({ path: '../.env' });

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
    // () => deploy(ContractName.DELEGATE_MANAGER, ['KBC Delegate Manager', '1.0.1', 222])
    // () =>
    //     deploy(
    //         ContractName.PRODUCT_CATEGORY_MANAGER,
    //         ['0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6'] // DelegateManager
    //     )
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
    //         '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
    //         '0x8f9c47afF2E345708f104000714215d865b73C29' // ProductCategoryManager
    //     ]),
    // () =>
    //     deploy(ContractName.DOCUMENT_MANAGER, [
    //         '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
    //         []
    //     ]),
    // () =>
    //     deploy(ContractName.ESCROW_MANAGER, [
    //         '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
    //         '0x30054880e4E2fA1082C1976cA5547cC3bd185c11', // ContractsOwner
    //         process.env.ESCROW_BASE_FEE || 20,
    //         process.env.ESCROW_COMMISSIONER_FEE || 1
    //     ]),
    // () =>
    //     deploy(ContractName.KBC_SHIPMENT_LIBRARY),
    () =>
        deploy(
            ContractName.TRADE_MANAGER,
            [
                '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
                '0x8f9c47afF2E345708f104000714215d865b73C29', // ProductCategoryManager
                '0x8628570545736D5c711734c36e4145F232134cB9', // MaterialManager
                '0xB1616b899bFa80B8613d20c689621C66A79aAa36', // DocumentManager
                '0x52A45e1bfAd77E396B7c5180E499B69fA5BB93b8', // EnumerableFiatManager
                '0x108a6ea0280500f7Ddf6434864B4124cdFd88D4C', // EnumerableUnitManager
                '0x70cDfdc6e3FBa73438f483C4c7a9A9bf71BDCfA0' // EscrowManager
            ],
            undefined,
            {
                KBCShipmentLibrary: '0xc79ad82de984f893148bEE79B33E7085AcFd3c02' // KBC_SHIPMENT_LIBRARY
            }
        ),
    // () =>
    //     deploy(ContractName.RELATIONSHIP_MANAGER, [
    //         '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
    //         ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'] // ContractsOwner
    //     ]),
    () =>
        deploy(ContractName.ASSET_OPERATION_MANAGER, [
            '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
            '0x8628570545736D5c711734c36e4145F232134cB9', // MaterialManager
            '0xb8e699A624963AAcdfe793cE4bbCE856Dcd67eB0' // EnumerableProcessTypeManager
        ])
    // () =>
    //     deploy(ContractName.OFFER_MANAGER, [
    //         '0x508d92D0235B2bd1060c93FA9D2c8A21D801e1d6', // DelegateManager
    //         ['0x30054880e4E2fA1082C1976cA5547cC3bd185c11'], // ContractsOwner
    //         '0x8f9c47afF2E345708f104000714215d865b73C29' // ProductCategoryManager
    //     ])
    // () => deploy(
    //     ContractName.MY_TOKEN, [10000],
    // ),
    // () => deploy(
    //     ContractName.ETHEREUM_DID_REGISTRY, [],
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
