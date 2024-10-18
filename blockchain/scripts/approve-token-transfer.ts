import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';

const main = async (escrowAddress: string, amount: number) => {
    const wallet = new Wallet('0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264', new JsonRpcProvider('http://localhost:8545'));
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach('0xc5a5C42992dECbae36851359345FE25997F5C42d');
    const tx = await myToken.connect(wallet).approve(escrowAddress, amount);
    const receipt = await tx.wait();
    console.log('receipt:', receipt);
    console.log('Balance', await myToken.connect(wallet).balanceOf(wallet.address));
};

main('0x0665FbB86a3acECa91Df68388EC4BBE11556DDce', 100).catch(console.error);
