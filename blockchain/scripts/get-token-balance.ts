import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../constants/contracts';
import { getRequiredEnvs } from '../utils/env';

const env = getRequiredEnvs('TOKEN_OWNER_PRIVATE_KEY', 'RPC_URL', 'TOKEN_ADDRESS', 'ESCROW_ADDRESS', 'SUPPLIER_ADDRESS', 'COMMISSIONER_ADDRESS');

const main = async (address: string) => {
    const wallet = new Wallet(env.TOKEN_OWNER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL)); // Commissioner
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach(env.TOKEN_ADDRESS);
    console.log('Balance', await myToken.connect(wallet).balanceOf(address));
};

const getEscrowPayee = async () => {
    const wallet = new Wallet(env.TOKEN_OWNER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL)); // Commissioner
    const Escrow = await ethers.getContractFactory(ContractName.ESCROW);
    const escrow = Escrow.attach(env.ESCROW_ADDRESS);
    console.log('Escrow data', await escrow.connect(wallet).getPayee());
};

main(env.SUPPLIER_ADDRESS).catch(console.error);
main(env.COMMISSIONER_ADDRESS).catch(console.error);
main(env.ESCROW_ADDRESS).catch(console.error);

getEscrowPayee().catch(console.error);
