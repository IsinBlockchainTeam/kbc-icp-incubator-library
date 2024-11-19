import { BigNumber, Event, Signer } from 'ethers';
import { jwtDecode } from 'jwt-decode';
import { RevocationRegistry__factory } from '../smart-contracts';
import { CredentialStatus } from '../types/CredentialStatus';

export interface StatusEntry {
    type: string;
    id: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
}

export interface JWTDecodedExtended {
    status?: StatusEntry;
    [key: string]: any;
}

export const METHOD_NAME = 'EthrStatusRegistry2019';

export class CredentialRevocationDriver {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    private getCredentialId(jwt: JWTDecodedExtended): string {
        let credentialId = jwt.id;
        if (!credentialId && jwt.vc) credentialId = jwt.vc.id;
        if (!credentialId) credentialId = jwt.jti;
        if (!credentialId && jwt.vc) credentialId = jwt.vc.jti;
        if (!credentialId)
            throw new Error('Credential not revocable: credential is missing "id" property');

        return credentialId;
    }

    private async getRevocationRegistry(jwt: JWTDecodedExtended) {
        let statusEntry = jwt.credentialStatus;
        if (!statusEntry) {
            if (!jwt.vc)
                throw new Error(
                    'Credential not revocable: credential is missing "credentialStatus" property'
                );
            statusEntry = jwt.vc.credentialStatus;
        }

        if (statusEntry.type !== METHOD_NAME)
            throw new Error(
                'Credential not revocable: credentialStatus type is not supported. Supported types: ' +
                    METHOD_NAME
            );

        const registryCoord = statusEntry.id.split(':');
        if (registryCoord.length !== 2)
            throw new Error(
                'Credential not revocable: malformed "id" field in "credentialStatus" entry'
            );

        const registryAddress = registryCoord[1];
        return RevocationRegistry__factory.connect(registryAddress, this.signer.provider!).connect(
            this.signer
        );
    }

    async revoke(jwt: string): Promise<string> {
        const decoded = jwtDecode(jwt) as JWTDecodedExtended;
        const revocationRegistry = await this.getRevocationRegistry(decoded);
        const id = this.getCredentialId(decoded);

        const tx: any = await revocationRegistry.revoke(id);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during credential revocation, no events found');
        }
        return events.find((event: Event) => event.event === 'Revoked').args[1];
    }

    async revoked(jwt: string): Promise<CredentialStatus> {
        const decoded = jwtDecode(jwt) as JWTDecodedExtended;
        const revocationRegistry = await this.getRevocationRegistry(decoded);
        const issuerDid = decoded.iss;
        const issuer = issuerDid.split(':')[issuerDid.split(':').length - 1];
        const id = this.getCredentialId(decoded);
        // const hash = keccak256(toUtf8Bytes(id));

        const result: BigNumber = await revocationRegistry.revoked(issuer, id);
        const blockNumber = result.toNumber();
        return blockNumber === 0 ? { revoked: false } : { revoked: true, blockNumber };
    }
}
