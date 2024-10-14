import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../../icp/ts-canister/.dfx/local/canisters/certification_manager/service.did';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';
import { EntityBuilder } from '../../utils/icp/EntityBuilder';
import { createActor } from '../../declarations/certification_manager';
import {
    DocumentInfo,
    DocumentEvaluationStatus
} from '../../../icp/ts-canister/src/models/Certificate';

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
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: DocumentInfo,
        validFrom: Date,
        validUntil: Date
    ) {
        const certificate = await this._actor.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime())
        );
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    // async registerScopeCertificate(
    //     roleProof: RoleProof,
    //     issuer: string,
    //     subject: string,
    //     assessmentStandard: string,
    //     assessmentAssuranceLevel: string,
    //     referenceId: string,
    //     document: DocumentInfo,
    //     validFrom: Date,
    //     validUntil: Date,
    //     processTypes: string[]
    // ): Promise<ScopeCertificate> {
    //     const certificate = await this._actor.registerScopeCertificate(
    //         roleProof,
    //         issuer,
    //         subject,
    //         assessmentStandard,
    //         assessmentAssuranceLevel,
    //         referenceId,
    //         document,
    //         BigInt(validFrom.getTime()),
    //         BigInt(validUntil.getTime()),
    //         processTypes
    //     );
    //     return EntityBuilder.buildScopeCertificate(certificate);
    // }
    //
    // async registerMaterialCertificate(
    //     roleProof: RoleProof,
    //     issuer: string,
    //     subject: string,
    //     assessmentStandard: string,
    //     assessmentAssuranceLevel: string,
    //     referenceId: string,
    //     document: DocumentInfo,
    //     materialId: number
    // ): Promise<MaterialCertificate> {
    //     const certificate = await this._actor.registerMaterialCertificate(
    //         roleProof,
    //         issuer,
    //         subject,
    //         assessmentStandard,
    //         assessmentAssuranceLevel,
    //         referenceId,
    //         document,
    //         BigInt(materialId)
    //     );
    //     return EntityBuilder.buildMaterialCertificate(certificate);
    // }

    async getBaseCertificatesInfoBySubject(roleProof: RoleProof, subject: string) {
        return this._actor.getBaseCertificatesInfoBySubject(roleProof, subject);
    }

    async getCompanyCertificates(roleProof: RoleProof, subject: string) {
        return this._actor.getCompanyCertificates(roleProof, subject);
    }

    async getScopeCertificates(roleProof: RoleProof, subject: string) {
        return this._actor.getScopeCertificates(roleProof, subject);
    }

    async getMaterialCertificates(roleProof: RoleProof, subject: string) {
        return this._actor.getMaterialCertificates(roleProof, subject);
    }

    async getCompanyCertificate(roleProof: RoleProof, subject: string, id: number) {
        return this._actor.getCompanyCertificate(roleProof, subject, BigInt(id));
    }

    async getScopeCertificate(roleProof: RoleProof, subject: string, id: number) {
        return this._actor.getScopeCertificate(roleProof, subject, BigInt(id));
    }

    async getMaterialCertificate(roleProof: RoleProof, subject: string, id: number) {
        return this._actor.getMaterialCertificate(roleProof, subject, BigInt(id));
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date
    ) {
        return this._actor.updateCompanyCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime())
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ) {
        return this._actor.updateScopeCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            processTypes
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        materialId: number
    ) {
        // TODO: check that only uploader can update the certificate
        return this._actor.updateMaterialCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            BigInt(materialId)
        );
    }

    async updateDocument(roleProof: RoleProof, certificateId: number, document: DocumentInfo) {
        return this._actor.updateDocument(roleProof, BigInt(certificateId), document);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus
    ) {
        return this._actor.evaluateDocument(
            roleProof,
            BigInt(certificateId),
            BigInt(documentId),
            evaluationStatus
        );
    }
}
