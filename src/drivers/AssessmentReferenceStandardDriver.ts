import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { AssessmentReferenceStandard } from '../entities/AssessmentReferenceStandard';
import { EntityBuilder } from '../utils/EntityBuilder';
import { HandleIcpError } from '../decorators/HandleIcpError';

export class AssessmentReferenceStandardDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    @HandleIcpError()
    async getAll(): Promise<AssessmentReferenceStandard[]> {
        const assessmentReferenceStandards = await this._actor.getAllAssessmentReferenceStandards();
        return assessmentReferenceStandards.map(EntityBuilder.buildAssessmentReferenceStandard);
    }

    @HandleIcpError()
    async getById(id: number): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.getAssessmentReferenceStandard(BigInt(id))
        );
    }

    @HandleIcpError()
    async add(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string,
        industrialSector?: string
    ): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.addAssessmentReferenceStandard(
                name,
                sustainabilityCriteria,
                logoUrl,
                siteUrl,
                industrialSector || ''
            )
        );
    }

    @HandleIcpError()
    async removeById(id: number, industrialSector?: string): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.removeAssessmentReferenceStandard(BigInt(id), industrialSector || '')
        );
    }
}
