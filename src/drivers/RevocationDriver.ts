import { Signer } from 'ethers';
import { RevocationRegistry, RevocationRegistry__factory } from '../smart-contracts';
import { RevocationStatus } from '../types/RevocationStatus';

export class RevocationDriver {
    private _contract: RevocationRegistry;

    constructor(signer: Signer, registryAddress: string) {
        this._contract = RevocationRegistry__factory.connect(
            registryAddress,
            signer.provider!
        ).connect(signer);
    }

    async revoke(hash: string): Promise<void> {
        const tx = await this._contract.revoke(hash);
        await tx.wait();
    }

    async revoked(issuer: string, hash: string): Promise<RevocationStatus> {
        const result = await this._contract.revoked(issuer, hash);
        const blockNumber = result.toNumber();
        return blockNumber === 0 ? { revoked: false } : { revoked: true, blockNumber };
    }
}
