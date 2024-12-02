import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../constants/contracts';
import { getRequiredEnvs } from '../utils/env';

const env = getRequiredEnvs('COMMISSIONER_PRIVATE_KEY', 'RPC_URL', 'TOKEN_ADDRESS', 'ESCROW_ADDRESS');

const main = async (amount: number) => {
    const wallet = new Wallet(env.COMMISSIONER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL)); // Commissioner
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach(env.TOKEN_ADDRESS);
    const tx = await myToken.connect(wallet).approve(env.ESCROW_ADDRESS, amount);
    const receipt = await tx.wait();
    console.log('receipt:', receipt);
    console.log('Allowed:', await myToken.allowance(wallet.address, env.ESCROW_ADDRESS));
    console.log('Balance', await myToken.connect(wallet).balanceOf(wallet.address));
};

main(100).catch(console.error); // Escrow address
