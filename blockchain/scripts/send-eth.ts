import {ethers} from "hardhat";
import {Contract} from "ethers";

async function getAttachedContract(contractName: string, contractAddress: string): Promise<Contract> {
    const ContractFactory = await ethers.getContractFactory(contractName);
    return ContractFactory.attach(contractAddress);
}
const main = async () => {
    const [_, owner] = await ethers.getSigners();
    const tx = await owner.sendTransaction({
        to: '0xb2F1AF19756a1D5D512B5A758f28041976D8a780',
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
