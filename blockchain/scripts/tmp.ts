import EscrowManagerAbi from '../artifacts/contracts/EscrowManager.sol/EscrowManager.json';
import { ethers } from 'ethers';

const main = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/holesky');
    // const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const shipmentId = 10;

    const contract = new ethers.Contract('0xd6424278e02cbC0111db9b60B9D8072938CDC398', EscrowManagerAbi.abi, wallet);
    // const contract = new ethers.Contract('0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1', EscrowManagerAbi.abi, wallet);

    const populatedTransaction = await contract.populateTransaction.registerEscrow(
        shipmentId,
        wallet.address,
        1000,
        '0xc204d8b5Ee2E2D46387da857ebb0D4fC88438926'
        // '0xc5a5C42992dECbae36851359345FE25997F5C42d'
    );
    console.log(populatedTransaction);

    // const populatedTransaction = await contract.populateTransaction.addAdmin('0xD594731AA232D7BCAf46Af12916775b395c1B7d7');

    const transactionResponse = await wallet.sendTransaction(populatedTransaction);

    const receipt = await transactionResponse.wait();
    console.log('Transaction Receipt:', receipt);

    const result = await contract.getEscrowByShipmentId(shipmentId);
    console.log(result);
};

main().catch(console.error);
