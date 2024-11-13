import { Wallet } from 'ethers';

export abstract class EthereumHelper {
    public static getAddressFromPrivateKey = (privateKey: string): string => {
        const wallet = new Wallet(privateKey);
        return wallet.address;
    };
}
