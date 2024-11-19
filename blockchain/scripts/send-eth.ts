import { ethers } from 'hardhat';
import { getRequiredEnvs } from '../utils/env';

const env = getRequiredEnvs('ENTITY_MANAGER_CANISTER_ADDRESS', 'SUPPLIER_ADDRESS', 'COMMISSIONER_ADDRESS');

const main = async (address: string) => {
    const [_, owner] = await ethers.getSigners();
    const tx = await owner.sendTransaction({
        to: address,
        value: ethers.utils.parseEther('1000')
    });
    const resp = await tx.wait();
    console.log(resp);
};

main(env.ENTITY_MANAGER_CANISTER_ADDRESS).catch(console.error);
main(env.SUPPLIER_ADDRESS).catch(console.error);
main(env.COMMISSIONER_ADDRESS).catch(console.error);
