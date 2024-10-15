import { _SERVICE } from '../../declarations/document_manager/document_manager.did';
import { ActorSubclass, type Identity } from '@dfinity/agent';
import { createActor } from '../../declarations/document_manager';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';

export class DocumentManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    public async getDocument(roleProof: RoleProof, id: number) {
        return this._actor.getDocument(roleProof, BigInt(id));
    }

    public async getDocuments(roleProof: RoleProof) {
        return this._actor.getDocuments(roleProof);
    }

    public async createDocument(
        roleProof: RoleProof,
        externalUrl: string,
        contentHash: string,
        uploadedBy: string
    ) {
        return this._actor.registerDocument(roleProof, externalUrl, contentHash, uploadedBy);
    }

    public async updateDocument(
        roleProof: RoleProof,
        id: number,
        externalUrl: string,
        contentHash: string,
        uploadedBy: string
    ) {
        return this._actor.updateDocument(
            roleProof,
            BigInt(id),
            externalUrl,
            contentHash,
            uploadedBy
        );
    }
}
