import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import {
    CertificateDocumentInfo as ICPCertificateDocumentInfo,
    EvaluationStatus as ICPEvaluationStatus
} from '@kbc-lib/azle-types';
import { CertificationDriver } from '../CertificationDriver';
import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateDocumentType
} from '../../entities/Certificate';
import { CompanyCertificate } from '../../entities/CompanyCertificate';
import { ScopeCertificate } from '../../entities/ScopeCertificate';
import { MaterialCertificate } from '../../entities/MaterialCertificate';
import { EntityBuilder } from '../../utils/EntityBuilder';
import { EvaluationStatus } from '../../entities/Evaluation';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('CertificationDriver', () => {
    let certificationDriver: CertificationDriver;
    const mockedActor = {
        registerCompanyCertificate: jest.fn(),
        registerScopeCertificate: jest.fn(),
        registerMaterialCertificate: jest.fn(),
        getBaseCertificateById: jest.fn(),
        getBaseCertificatesInfoBySubject: jest.fn(),
        getCompanyCertificates: jest.fn(),
        getScopeCertificates: jest.fn(),
        getMaterialCertificates: jest.fn(),
        getCompanyCertificate: jest.fn(),
        getScopeCertificate: jest.fn(),
        getMaterialCertificate: jest.fn(),
        updateCompanyCertificate: jest.fn(),
        updateScopeCertificate: jest.fn(),
        updateMaterialCertificate: jest.fn(),
        evaluateCertificateDocument: jest.fn(),
        getMaterial: jest.fn(),
        updateCertificateDocument: jest.fn()
    };
    const defaultEntities = {
        icpCertificateDocument: {} as ICPCertificateDocumentInfo,
        icpEvaluationStatus: {} as ICPEvaluationStatus,
        baseCertificate: { id: 0 } as BaseCertificate,
        companyCertificate: { id: 0 } as CompanyCertificate,
        scopeCertificate: { id: 0 } as ScopeCertificate,
        materialCertificate: { id: 0 } as MaterialCertificate
    };
    const issuer = 'issuer';
    const subject = 'subject';
    const assessmentReferenceStandardId = 2;
    const assessmentAssuranceLevel = 'assessmentAssuranceLevel';
    const document: CertificateDocumentInfo = {
        referenceId: 'referenceId',
        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
        externalUrl: 'externalUrl',
        metadata: {
            filename: 'file.pdf',
            fileType: 'application/pdf'
        }
    };
    const validFrom = new Date();
    const validUntil = new Date(new Date().setDate(validFrom.getDate() + 1));

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue(mockedActor);
        const icpIdentity = {} as Identity;
        certificationDriver = new CertificationDriver(icpIdentity, 'canisterId');

        jest.spyOn(EntityBuilder, 'buildICPCertificateDocumentInfo').mockReturnValue(
            defaultEntities.icpCertificateDocument
        );
        jest.spyOn(EntityBuilder, 'buildBaseCertificate').mockReturnValue(
            defaultEntities.baseCertificate
        );
        jest.spyOn(EntityBuilder, 'buildCompanyCertificate').mockReturnValue(
            defaultEntities.companyCertificate
        );
        jest.spyOn(EntityBuilder, 'buildScopeCertificate').mockReturnValue(
            defaultEntities.scopeCertificate
        );
        jest.spyOn(EntityBuilder, 'buildMaterialCertificate').mockReturnValue(
            defaultEntities.materialCertificate
        );
        jest.spyOn(EntityBuilder, 'buildICPEvaluationStatus').mockReturnValue(
            defaultEntities.icpEvaluationStatus
        );
    });

    describe('register certification', () => {
        it('should register a company certificate', async () => {
            mockedActor.registerCompanyCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.registerCompanyCertificate(
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                document,
                validFrom,
                validUntil,
                'notes'
            );
            expect(mockedActor.registerCompanyCertificate).toHaveBeenCalled();
            expect(mockedActor.registerCompanyCertificate).toHaveBeenCalledWith(
                issuer,
                subject,
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                defaultEntities.icpCertificateDocument,
                BigInt(validFrom.getTime()),
                BigInt(validUntil.getTime()),
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.companyCertificate);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalled();
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should register a scope certificate', async () => {
            const processTypes = ['processType'];
            mockedActor.registerScopeCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.registerScopeCertificate(
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                document,
                validFrom,
                validUntil,
                processTypes,
                'notes'
            );
            expect(mockedActor.registerScopeCertificate).toHaveBeenCalled();
            expect(mockedActor.registerScopeCertificate).toHaveBeenCalledWith(
                issuer,
                subject,
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                defaultEntities.icpCertificateDocument,
                BigInt(validFrom.getTime()),
                BigInt(validUntil.getTime()),
                processTypes,
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.scopeCertificate);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalled();
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should register a material certificate', async () => {
            const materialId = 1;
            mockedActor.registerMaterialCertificate.mockReturnValue({ id: 1 });
            mockedActor.getMaterial.mockReturnValue({ id: 2 });
            const certificate = await certificationDriver.registerMaterialCertificate(
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                document,
                materialId,
                'notes'
            );
            expect(mockedActor.registerMaterialCertificate).toHaveBeenCalled();
            expect(mockedActor.registerMaterialCertificate).toHaveBeenCalledWith(
                issuer,
                subject,
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                defaultEntities.icpCertificateDocument,
                BigInt(materialId),
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.materialCertificate);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalled();
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledWith(
                { id: 1 },
                { id: 2 }
            );
        });
    });

    describe('get certificates', () => {
        const id = 1;

        it('should get a base certificate by id', async () => {
            mockedActor.getBaseCertificateById.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.getBaseCertificateById(id);

            expect(mockedActor.getBaseCertificateById).toHaveBeenCalled();
            expect(mockedActor.getBaseCertificateById).toHaveBeenCalledWith(BigInt(id));
            expect(certificate).toEqual(defaultEntities.baseCertificate);
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalled();
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get base certificates info by subject', async () => {
            mockedActor.getBaseCertificatesInfoBySubject.mockReturnValue([{ id: 1 }]);
            const certificates =
                await certificationDriver.getBaseCertificatesInfoBySubject(subject);

            expect(mockedActor.getBaseCertificatesInfoBySubject).toHaveBeenCalled();
            expect(mockedActor.getBaseCertificatesInfoBySubject).toHaveBeenCalledWith(subject);
            expect(certificates).toEqual([defaultEntities.baseCertificate]);
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get company certificates', async () => {
            mockedActor.getCompanyCertificates.mockReturnValue([{ id: 1 }]);
            const certificates = await certificationDriver.getCompanyCertificates(subject);

            expect(mockedActor.getCompanyCertificates).toHaveBeenCalled();
            expect(mockedActor.getCompanyCertificates).toHaveBeenCalledWith(subject);
            expect(certificates).toEqual([defaultEntities.companyCertificate]);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get scope certificates', async () => {
            mockedActor.getScopeCertificates.mockReturnValue([{ id: 1 }]);
            const certificates = await certificationDriver.getScopeCertificates(subject);

            expect(mockedActor.getScopeCertificates).toHaveBeenCalled();
            expect(mockedActor.getScopeCertificates).toHaveBeenCalledWith(subject);
            expect(certificates).toEqual([defaultEntities.scopeCertificate]);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get material certificates', async () => {
            mockedActor.getMaterialCertificates.mockReturnValue([{ id: 1 }]);
            mockedActor.getMaterial.mockReturnValue({ id: 2 });
            const certificates = await certificationDriver.getMaterialCertificates(subject);

            expect(mockedActor.getMaterialCertificates).toHaveBeenCalled();
            expect(mockedActor.getMaterialCertificates).toHaveBeenCalledWith(subject);
            expect(certificates).toEqual([defaultEntities.materialCertificate]);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledWith(
                { id: 1 },
                { id: 2 }
            );
        });

        it('should get a company certificate', async () => {
            mockedActor.getCompanyCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.getCompanyCertificate(subject, id);

            expect(mockedActor.getCompanyCertificate).toHaveBeenCalled();
            expect(mockedActor.getCompanyCertificate).toHaveBeenCalledWith(subject, BigInt(id));
            expect(certificate).toEqual(defaultEntities.companyCertificate);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get a scope certificate', async () => {
            mockedActor.getScopeCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.getScopeCertificate(subject, id);

            expect(mockedActor.getScopeCertificate).toHaveBeenCalled();
            expect(mockedActor.getScopeCertificate).toHaveBeenCalledWith(subject, BigInt(id));
            expect(certificate).toEqual(defaultEntities.scopeCertificate);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should get a material certificate', async () => {
            mockedActor.getMaterialCertificate.mockReturnValue({ id: 1 });
            mockedActor.getMaterial.mockReturnValue({ id: 2 });
            const certificate = await certificationDriver.getMaterialCertificate(subject, id);

            expect(mockedActor.getMaterialCertificate).toHaveBeenCalled();
            expect(mockedActor.getMaterialCertificate).toHaveBeenCalledWith(subject, BigInt(id));
            expect(certificate).toEqual(defaultEntities.materialCertificate);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledWith(
                { id: 1 },
                { id: 2 }
            );
        });
    });

    describe('update certificates', () => {
        const id = 1;

        it('should update a company certificate', async () => {
            mockedActor.updateCompanyCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.updateCompanyCertificate(
                id,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                validFrom,
                validUntil,
                'notes'
            );

            expect(mockedActor.updateCompanyCertificate).toHaveBeenCalled();
            expect(mockedActor.updateCompanyCertificate).toHaveBeenCalledWith(
                BigInt(id),
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                BigInt(validFrom.getTime()),
                BigInt(validUntil.getTime()),
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.companyCertificate);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildCompanyCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should update a scope certificate', async () => {
            mockedActor.updateScopeCertificate.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.updateScopeCertificate(
                id,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                validFrom,
                validUntil,
                ['processType'],
                'notes'
            );

            expect(mockedActor.updateScopeCertificate).toHaveBeenCalled();
            expect(mockedActor.updateScopeCertificate).toHaveBeenCalledWith(
                BigInt(id),
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                BigInt(validFrom.getTime()),
                BigInt(validUntil.getTime()),
                ['processType'],
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.scopeCertificate);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildScopeCertificate).toHaveBeenCalledWith({ id: 1 });
        });

        it('should update a material certificate', async () => {
            mockedActor.updateMaterialCertificate.mockReturnValue({ id: 1 });
            mockedActor.getMaterial.mockReturnValue({ id: 2 });
            const certificate = await certificationDriver.updateMaterialCertificate(
                id,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                2,
                'notes'
            );

            expect(mockedActor.updateMaterialCertificate).toHaveBeenCalled();
            expect(mockedActor.updateMaterialCertificate).toHaveBeenCalledWith(
                BigInt(id),
                BigInt(assessmentReferenceStandardId),
                assessmentAssuranceLevel,
                BigInt(2),
                'notes'
            );
            expect(certificate).toEqual(defaultEntities.materialCertificate);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildMaterialCertificate).toHaveBeenCalledWith(
                { id: 1 },
                { id: 2 }
            );
        });

        it('should update a document', async () => {
            mockedActor.updateCertificateDocument.mockReturnValue({ id: 1 });
            const certificate = await certificationDriver.updateDocument(id, document);

            expect(mockedActor.updateCertificateDocument).toHaveBeenCalled();
            expect(mockedActor.updateCertificateDocument).toHaveBeenCalledWith(
                BigInt(id),
                defaultEntities.icpCertificateDocument
            );
            expect(certificate).toEqual(defaultEntities.baseCertificate);
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledTimes(1);
            expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledWith({ id: 1 });
        });
    });

    it('should evaluate a document', async () => {
        mockedActor.evaluateCertificateDocument.mockReturnValue({ id: 1 });
        const certificate = await certificationDriver.evaluateDocument(
            2,
            EvaluationStatus.APPROVED
        );

        expect(mockedActor.evaluateCertificateDocument).toHaveBeenCalled();
        expect(mockedActor.evaluateCertificateDocument).toHaveBeenCalledWith(
            BigInt(2),
            defaultEntities.icpEvaluationStatus
        );
        expect(certificate).toEqual(defaultEntities.baseCertificate);
        expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildBaseCertificate).toHaveBeenCalledWith({ id: 1 });
    });
});
