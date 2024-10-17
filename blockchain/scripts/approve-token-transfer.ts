import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';

const main = async (escrowAddress: string, amount: number) => {
    const wallet = new Wallet('0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264', new JsonRpcProvider('http://localhost:8545'));
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach('0xc5a5c42992decbae36851359345fe25997f5c42d');
    const tx = await myToken.connect(wallet).approve(escrowAddress, amount);
    const receipt = await tx.wait();
    console.log('receipt:', receipt);
    console.log('Balance', await myToken.connect(wallet).balanceOf(wallet.address));
};

main('0x3cE1C8F80f7C4594e8fb328D26dE8bCb85C80Fa2', 100).catch(console.error);
