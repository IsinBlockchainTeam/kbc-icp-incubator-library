import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

const main = async (address: string) => {
    if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY not found in .env file');

    const wallet = new Wallet(process.env.PRIVATE_KEY, new JsonRpcProvider(process.env.RPC_URL));
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach('0xc5a5C42992dECbae36851359345FE25997F5C42d');
    const tx = await myToken.connect(wallet).transfer(address, 100);
    const receipt = await tx.wait();
    console.log(`Tokens transferred to ${address}. Transaction hash: ${receipt.transactionHash}`);
};

main('0x2F2e2b138006ED0CcA198e7090dce5BACF02Bf26').catch(console.error); // Commissioner address
