import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';

export class SignerUtils {
    static getSignerFromPrivateKey(privateKey: string, provider: JsonRpcProvider): Signer {
        return new Wallet(privateKey, provider);
    }

    static getSignerFromBrowserProvider(browserProvider: ExternalProvider): Signer {
        const provider = new ethers.providers.Web3Provider(browserProvider);
        return provider.getSigner();
    }
}
