import { createMock } from 'ts-auto-mock';
import { CertificationService } from '../CertificationService';
import { BaseCertificate, CertificateDocumentType } from '../../entities/Certificate';
import { URL_SEGMENTS } from '../../constants/ICP';
import { CertificationDriver } from '../../drivers/CertificationDriver';
import { FileDriver } from '../../drivers/FileDriver';
import { CompanyCertificate } from '../../entities/CompanyCertificate';
import { ScopeCertificate } from '../../entities/ScopeCertificate';
import { MaterialCertificate } from '../../entities/MaterialCertificate';
import { EvaluationStatus } from '../../entities/Evaluation';
import FileHelpers from '../../utils/FileHelpers';

describe('CertificationService', () => {
    let certificationService: CertificationService;
    const mockedCertificationDriverFn = {
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
        updateDocument: jest.fn(),
        evaluateDocument: jest.fn()
    };
    const mockedICPFileDriverFn = {
        create: jest.fn(),
        read: jest.fn()
    };
    const issuer = '0xissuer';
    const subject = '0xsubject';
    const assessmentReferenceStandardId = 2;
    const assessmentAssuranceLevel = '0xassessmentAssuranceLevel';
    const documentRequest = {
        referenceId: '0xreferenceId',
        filename: 'file.pdf',
        fileType: 'application/pdf',
        fileContent: new Uint8Array(),
        storageConfig: {
            urlStructure: {
                prefix: 'prefix',
                organizationId: 1
            },
            resourceSpec: {
                name: 'file.pdf',
                type: 'application/pdf'
            },
            delegatedOrganizationIds: [0]
        },
        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY
    };
    const baseExternalUrl = `prefix/${URL_SEGMENTS.ORGANIZATION + documentRequest.storageConfig.urlStructure.organizationId}/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}`;
    const document = {
        referenceId: documentRequest.referenceId,
        documentType: documentRequest.documentType,
        externalUrl: baseExternalUrl,
        metadata: {
            filename: documentRequest.filename,
            fileType: documentRequest.fileType
        }
    };
    const validFrom = new Date();
    const validUntil = new Date(new Date().setDate(validFrom.getDate() + 1));

    beforeAll(() => {
        jest.spyOn(FileHelpers, 'ensureTrailingSlash').mockReturnValue('prefix/');
        const certificationDriver = createMock<CertificationDriver>(mockedCertificationDriverFn);
        const icpFileDriver = createMock<FileDriver>({
            create: mockedICPFileDriverFn.create,
            read: mockedICPFileDriverFn.read
        });
        certificationService = new CertificationService(certificationDriver, icpFileDriver);
    });

    it.each([
        {
            functionName: 'registerCompanyCertificate',
            serviceFunction: () =>
                certificationService.registerCompanyCertificate(
                    issuer,
                    subject,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    documentRequest,
                    validFrom,
                    validUntil,
                    'notes'
                ),
            driverFunction: mockedCertificationDriverFn.registerCompanyCertificate,
            driverFunctionResult: {} as CompanyCertificate,
            driverFunctionArgs: [
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                {
                    ...document,
                    externalUrl: `${baseExternalUrl}${URL_SEGMENTS.CERTIFICATION.COMPANY}${documentRequest.storageConfig.resourceSpec.name}`
                },
                validFrom,
                validUntil,
                'notes'
            ]
        },
        {
            functionName: 'registerScopeCertificate',
            serviceFunction: () =>
                certificationService.registerScopeCertificate(
                    issuer,
                    subject,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    documentRequest,
                    validFrom,
                    validUntil,
                    ['processTypes'],
                    'notes'
                ),
            driverFunction: mockedCertificationDriverFn.registerScopeCertificate,
            driverFunctionResult: {} as ScopeCertificate,
            driverFunctionArgs: [
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                {
                    ...document,
                    externalUrl: `${baseExternalUrl}${URL_SEGMENTS.CERTIFICATION.SCOPE}${documentRequest.storageConfig.resourceSpec.name}`
                },
                validFrom,
                validUntil,
                ['processTypes'],
                'notes'
            ]
        },
        {
            functionName: 'registerMaterialCertificate',
            serviceFunction: () =>
                certificationService.registerMaterialCertificate(
                    issuer,
                    subject,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    documentRequest,
                    1,
                    'notes'
                ),
            driverFunction: mockedCertificationDriverFn.registerMaterialCertificate,
            driverFunctionResult: {} as MaterialCertificate,
            driverFunctionArgs: [
                issuer,
                subject,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                {
                    ...document,
                    externalUrl: `${baseExternalUrl}${URL_SEGMENTS.CERTIFICATION.MATERIAL}${documentRequest.storageConfig.resourceSpec.name}`
                },
                1,
                'notes'
            ]
        },
        {
            functionName: 'getBaseCertificateById',
            serviceFunction: () => certificationService.getBaseCertificateById(1),
            driverFunction: mockedCertificationDriverFn.getBaseCertificateById,
            driverFunctionResult: {} as BaseCertificate,
            driverFunctionArgs: [1]
        },
        {
            functionName: 'getBaseCertificatesInfoBySubject',
            serviceFunction: () => certificationService.getBaseCertificatesInfoBySubject(subject),
            driverFunction: mockedCertificationDriverFn.getBaseCertificatesInfoBySubject,
            driverFunctionResult: [{} as BaseCertificate],
            driverFunctionArgs: [subject]
        },
        {
            functionName: 'getCompanyCertificates',
            serviceFunction: () => certificationService.getCompanyCertificates(subject),
            driverFunction: mockedCertificationDriverFn.getCompanyCertificates,
            driverFunctionResult: [{} as CompanyCertificate],
            driverFunctionArgs: [subject]
        },
        {
            functionName: 'getScopeCertificates',
            serviceFunction: () => certificationService.getScopeCertificates(subject),
            driverFunction: mockedCertificationDriverFn.getScopeCertificates,
            driverFunctionResult: [{} as ScopeCertificate],
            driverFunctionArgs: [subject]
        },
        {
            functionName: 'getMaterialCertificates',
            serviceFunction: () => certificationService.getMaterialCertificates(subject),
            driverFunction: mockedCertificationDriverFn.getMaterialCertificates,
            driverFunctionResult: [{} as MaterialCertificate],
            driverFunctionArgs: [subject]
        },
        {
            functionName: 'getCompanyCertificate',
            serviceFunction: () => certificationService.getCompanyCertificate(subject, 1),
            driverFunction: mockedCertificationDriverFn.getCompanyCertificate,
            driverFunctionResult: {} as CompanyCertificate,
            driverFunctionArgs: [subject, 1]
        },
        {
            functionName: 'getScopeCertificate',
            serviceFunction: () => certificationService.getScopeCertificate(subject, 1),
            driverFunction: mockedCertificationDriverFn.getScopeCertificate,
            driverFunctionResult: {} as ScopeCertificate,
            driverFunctionArgs: [subject, 1]
        },
        {
            functionName: 'getMaterialCertificate',
            serviceFunction: () => certificationService.getMaterialCertificate(subject, 1),
            driverFunction: mockedCertificationDriverFn.getMaterialCertificate,
            driverFunctionResult: {} as MaterialCertificate,
            driverFunctionArgs: [subject, 1]
        },
        {
            functionName: 'updateCompanyCertificate',
            serviceFunction: () =>
                certificationService.updateCompanyCertificate(
                    1,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    validFrom,
                    validUntil,
                    'notes updated'
                ),
            driverFunction: mockedCertificationDriverFn.updateCompanyCertificate,
            driverFunctionResult: {} as CompanyCertificate,
            driverFunctionArgs: [
                1,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                validFrom,
                validUntil,
                'notes updated'
            ]
        },
        {
            functionName: 'updateScopeCertificate',
            serviceFunction: () =>
                certificationService.updateScopeCertificate(
                    1,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    validFrom,
                    validUntil,
                    ['processTypes1', 'processTypes2'],
                    'notes updated'
                ),
            driverFunction: mockedCertificationDriverFn.updateScopeCertificate,
            driverFunctionResult: {} as ScopeCertificate,
            driverFunctionArgs: [
                1,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                validFrom,
                validUntil,
                ['processTypes1', 'processTypes2'],
                'notes updated'
            ]
        },
        {
            functionName: 'updateMaterialCertificate',
            serviceFunction: () =>
                certificationService.updateMaterialCertificate(
                    1,
                    assessmentReferenceStandardId,
                    assessmentAssuranceLevel,
                    3,
                    'notes updated'
                ),
            driverFunction: mockedCertificationDriverFn.updateMaterialCertificate,
            driverFunctionResult: {} as MaterialCertificate,
            driverFunctionArgs: [
                1,
                assessmentReferenceStandardId,
                assessmentAssuranceLevel,
                3,
                'notes updated'
            ]
        },
        {
            functionName: 'evaluateDocument',
            serviceFunction: () =>
                certificationService.evaluateDocument(1, EvaluationStatus.APPROVED),
            driverFunction: mockedCertificationDriverFn.evaluateDocument,
            driverFunctionResult: {} as BaseCertificate,
            driverFunctionArgs: [1, EvaluationStatus.APPROVED]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );

    it('should call updateDocument', async () => {
        mockedCertificationDriverFn.getBaseCertificateById.mockResolvedValue({
            document
        } as BaseCertificate);
        mockedCertificationDriverFn.updateDocument.mockResolvedValue({} as BaseCertificate);
        await expect(
            certificationService.updateDocument(1, {
                ...documentRequest,
                filename: 'file_updated.pdf'
            })
        ).resolves.toEqual({} as BaseCertificate);

        expect(mockedCertificationDriverFn.getBaseCertificateById).toHaveBeenCalled();
        expect(mockedCertificationDriverFn.getBaseCertificateById).toHaveBeenCalledWith(1);
        expect(mockedICPFileDriverFn.create).toHaveBeenCalled();
        expect(mockedCertificationDriverFn.updateDocument).toHaveBeenCalled();
        expect(mockedCertificationDriverFn.updateDocument).toHaveBeenCalledWith(1, {
            ...document,
            externalUrl: `${document.externalUrl}${documentRequest.storageConfig.resourceSpec.name}`,
            metadata: {
                filename: 'file_updated.pdf',
                fileType: documentRequest.fileType
            }
        });
    });

    it('should call getScopeCertificatesByProcessType', async () => {
        mockedCertificationDriverFn.getScopeCertificates.mockResolvedValue([{
            id: 1, processTypes: ['processType1']
        }, {
            id: 2, processTypes: ['processType2']
        }]);
        await expect(certificationService.getScopeCertificatesByProcessType(subject, 'processType2')).resolves.toEqual([
            { id: 2, processTypes: ['processType2'] }
        ]);

        expect(mockedCertificationDriverFn.getScopeCertificates).toHaveBeenCalled();
        expect(mockedCertificationDriverFn.getScopeCertificates).toHaveBeenCalledWith(subject);
    });

    it('should call getMaterialCertificatesByMaterialId', async () => {
        mockedCertificationDriverFn.getMaterialCertificates.mockResolvedValue([{
            id: 1, material: { id: 1 }
        }, {
            id: 2, material: { id: 2 }
        }]);
        await expect(certificationService.getMaterialCertificatesByMaterialId(subject, 2)).resolves.toEqual([
            { id: 2, material: { id: 2 } }
        ]);

        expect(mockedCertificationDriverFn.getMaterialCertificates).toHaveBeenCalled();
        expect(mockedCertificationDriverFn.getMaterialCertificates).toHaveBeenCalledWith(subject);
    });

});
