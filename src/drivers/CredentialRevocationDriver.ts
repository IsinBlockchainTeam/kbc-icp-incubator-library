import { Event, Signer } from 'ethers';
import { jwtDecode } from 'jwt-decode';
import { RevocationRegistry__factory } from '../smart-contracts';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { RevocationStatus, ValidStatus } from '../types/RevocationStatus';

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

const METHOD_NAME = 'EthrStatusRegistry2019';

export class CredentialRevocationDriver {
    private readonly signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    async revoke(jwt: string): Promise<void> {
        const decoded = jwtDecode(jwt) as JWTDecodedExtended;
        let statusEntry = decoded.credentialStatus;
        if (!statusEntry) statusEntry = decoded.vc.credentialStatus;

        if (!statusEntry)
            throw new Error(
                'Credential not revocable: credential is missing "credentialStatus" property'
            );

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
        const revocationRegistry = RevocationRegistry__factory.connect(
            registryAddress,
            this.signer
        );

        const hash = keccak256(toUtf8Bytes(jwt));

        const tx = await revocationRegistry.revoke(hash);
        await tx.wait();
    }

    async revoked(jwt: string): Promise<RevocationStatus> {
        const decoded = jwtDecode(jwt) as JWTDecodedExtended;
        let statusEntry = decoded.credentialStatus;
        if (!statusEntry) statusEntry = decoded.vc.credentialStatus;

        if (!statusEntry)
            throw new Error(
                'Credential not revocable: credential is missing "credentialStatus" property'
            );

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
        const revocationRegistry = RevocationRegistry__factory.connect(
            registryAddress,
            this.signer
        );

        const issuerDid = decoded.iss;
        const issuer = issuerDid.split(':')[issuerDid.split(':').length - 1];
        const hash = keccak256(toUtf8Bytes(jwt));

        const result = await revocationRegistry.revoked(issuer, hash);
        const blockNumber = result.toNumber();
        return blockNumber === 0 ? { revoked: false } : { revoked: true, blockNumber };
    }
}
