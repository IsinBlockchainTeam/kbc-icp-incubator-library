import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../constants/contracts';
import { getRequiredEnvs } from '../utils/env';

const env = getRequiredEnvs(
    'TOKEN_OWNER_PRIVATE_KEY',
    'RPC_URL',
    'TOKEN_ADDRESS',
    'DOWN_PAYMENT_ADDRESS',
    'SUPPLIER_ADDRESS',
    'COMMISSIONER_ADDRESS'
);

const main = async (address: string) => {
    const wallet = new Wallet(env.TOKEN_OWNER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL)); // Commissioner
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach(env.TOKEN_ADDRESS);
    console.log('Balance', await myToken.connect(wallet).balanceOf(address));
};

const getDownPaymentPayee = async () => {
    const wallet = new Wallet(env.TOKEN_OWNER_PRIVATE_KEY, new JsonRpcProvider(env.RPC_URL)); // Commissioner
    const DownPayment = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
    const downPayment = DownPayment.attach(env.DOWN_PAYMENT_ADDRESS);
    console.log('Down payment data', await downPayment.connect(wallet).getPayee());
};

main(env.SUPPLIER_ADDRESS).catch(console.error);
main(env.COMMISSIONER_ADDRESS).catch(console.error);
main(env.DOWN_PAYMENT_ADDRESS).catch(console.error);

getDownPaymentPayee().catch(console.error);
