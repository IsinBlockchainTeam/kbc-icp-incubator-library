import { ethers } from 'hardhat';
import { ContractName } from '../constants/contracts';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getRequiredEnvs } from '../utils/env';

const env = getRequiredEnvs('TOKEN_OWNER_PRIVATE_KEY', 'RPC_URL', 'TOKEN_ADDRESS', 'COMMISSIONER_ADDRESS');

const main = async (address: string) => {
    const wallet = new Wallet(env.TOKEN_OWNER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL));
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach(env.TOKEN_ADDRESS);
    const tx = await myToken.connect(wallet).transfer(address, 100);
    const receipt = await tx.wait();
    console.log(`Tokens transferred to ${address}. Transaction hash: ${receipt.transactionHash}`);
};

main(env.COMMISSIONER_ADDRESS).catch(console.error);
