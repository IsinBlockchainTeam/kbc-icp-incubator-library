import { ethers } from 'hardhat';
import { Contract } from 'ethers';

async function getAttachedContract(contractName: string, contractAddress: string): Promise<Contract> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    return ContractFactory.attach(contractAddress);
}
const main = async () => {
    const [_, owner] = await ethers.getSigners();
    const tx = await owner.sendTransaction({
        // to: '0x16bFc34f7936e829e980b6D77E436765f57415E8',
        to: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
        value: ethers.utils.parseEther('1000')
    });
    const resp = await tx.wait();
    console.log(resp);

    // const contract = await getAttachedContract('EscrowManager', '0xb880b74bc2f24ad7c7fB9bc739039c51Dd6077f0');
    // const tx = await contract.addAdminTemp(owner.address);
    // const resp = await tx.wait();
    // console.log(resp);
};
main().catch(console.error);
