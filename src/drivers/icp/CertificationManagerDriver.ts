import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../../icp/ts-canister/.dfx/local/canisters/certification_manager/service.did';
import { createActor } from '../../declarations/certification_manager';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';
import { CompanyCertificate, DocumentInfo } from '../../../icp/ts-canister/src/models/Certificate';

export class CertificationManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        document: DocumentInfo,
        validFrom: Date,
        validUntil: Date
    ) {
        return this._actor.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime())
        );
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<CompanyCertificate> {
        // @ts-ignore
        return this._actor.getCompanyCertificate(roleProof, subject, BigInt(id));
    }
}
