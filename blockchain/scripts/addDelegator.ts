import { ethers } from 'hardhat';

const addDelegator = async (delegatorAddress: string, delegateManagerAddress: string) => {
    if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
        throw new Error('PRIVATE_KEY and RPC_URL must be provided');
    }
    const privateKey = process.env.PRIVATE_KEY;
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    const DelegateManager = await ethers.getContractFactory('DelegateManager');
    const delegateManager = DelegateManager.attach(delegateManagerAddress);
    await delegateManager.connect(signer).addDelegator(delegatorAddress, {
        gasLimit: (await provider.getBlock('latest')).gasLimit.toString()
    });
    console.log(`Delegator ${delegatorAddress} added to DelegateManager ${delegateManagerAddress}`);
};

addDelegator('0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123', '0x3Ff0ad86d0C8A8cA2f61e1ADe53aCA15f181285d');
