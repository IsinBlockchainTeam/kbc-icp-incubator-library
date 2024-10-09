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
    () => deploy(ContractName.MY_TOKEN, [10000]),
    () => deploy(ContractName.REVOCATION_REGISTRY, []),
    () => deploy(ContractName.DELEGATE_MANAGER, ['KBC Delegate Manager', '1.0.1', 31337, contractMap.get(ContractName.REVOCATION_REGISTRY)!.address]),
    () =>
        deploy(ContractName.ESCROW_MANAGER, [
            contractMap.get(ContractName.DELEGATE_MANAGER)!.address,
            process.env.COMMISSIONER_ADMIN || '',
            process.env.ESCROW_BASE_FEE || 20,
            process.env.ESCROW_COMMISSIONER_FEE || 1
        ]),
]).catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
});
