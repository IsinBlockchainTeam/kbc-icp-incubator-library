import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';

const main = async (address: string) => {
    const wallet = new Wallet('ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985', new JsonRpcProvider('http://localhost:8545')); // Commissioner
    const MyToken = await ethers.getContractFactory(ContractName.MY_TOKEN);
    const myToken = MyToken.attach('0xc5a5C42992dECbae36851359345FE25997F5C42d');
    console.log('Balance', await myToken.connect(wallet).balanceOf(address));
};

const getEscrowPayee = async (address: string) => {
    const wallet = new Wallet('ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985', new JsonRpcProvider('http://localhost:8545')); // Commissioner
    const Escrow = await ethers.getContractFactory(ContractName.ESCROW);
    const escrow = Escrow.attach(address);
    console.log('Escrow data', await escrow.connect(wallet).getPayee());
};

main('0xa1f48005f183780092E0E277B282dC1934AE3308').catch(console.error); // Supplier address
main('0x2F2e2b138006ED0CcA198e7090dce5BACF02Bf26').catch(console.error); // Customer address
main('0x56639dB16Ac50A89228026e42a316B30179A5376').catch(console.error); // Escrow address

getEscrowPayee('0x56639dB16Ac50A89228026e42a316B30179A5376').catch(console.error); // Escrow address
