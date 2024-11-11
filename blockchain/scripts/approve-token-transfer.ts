import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';

const main = async (escrowAddress: string, amount: number) => {
    const wallet = new Wallet('ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985', new JsonRpcProvider('http://localhost:8545')); // Commissioner
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach('0xc5a5C42992dECbae36851359345FE25997F5C42d');
    const tx = await myToken.connect(wallet).approve(escrowAddress, amount);
    const receipt = await tx.wait();
    console.log('receipt:', receipt);
    console.log('Balance', await myToken.connect(wallet).balanceOf(wallet.address));
};

main('0x56639dB16Ac50A89228026e42a316B30179A5376', 100).catch(console.error); // Escrow address
