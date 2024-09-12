import { createMock } from 'ts-auto-mock';
import { Wallet } from 'ethers';
import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificateManagerDriver } from '../drivers/CertificateManagerDriver';
import { RoleProof } from '../types/RoleProof';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { CertificateDocument, CertificateManagerService } from './CertificateManagerService';
import { DocumentEvaluationStatus, DocumentType } from '../entities/Certificate';
import { URLStructure } from '../types/URLStructure';
import { URL_SEGMENTS } from '../constants/ICP';

describe('CertificateManagerService', () => {
    const mockedCertificateManagerDriver = createMock<CertificateManagerDriver>({
        registerCompanyCertificate: jest.fn(),
        registerScopeCertificate: jest.fn(),
        registerMaterialCertificate: jest.fn(),
        getCertificateIdsBySubject: jest.fn(),
        getBaseCertificatesInfoBySubject: jest.fn(),
        getCompanyCertificates: jest.fn(),
        getCompanyCertificate: jest.fn(),
        getScopeCertificates: jest.fn(),
        getScopeCertificate: jest.fn(),
        getMaterialCertificates: jest.fn(),
        getMaterialCertificate: jest.fn(),
        updateCompanyCertificate: jest.fn(),
        updateScopeCertificate: jest.fn(),
        updateMaterialCertificate: jest.fn(),
        evaluateDocument: jest.fn(),
        updateDocument: jest.fn(),
        getBaseCertificateInfoById: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn()
    });

    const mockedDocumentDriver = createMock<DocumentDriver>({
        getDocumentById: jest.fn(),
        registerDocument: jest.fn()
    });

    const mockedIcpFileDriver = createMock<ICPFileDriver>({
        read: jest.fn(),
        create: jest.fn()
    });

    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };
    const issuer = Wallet.createRandom().address;
    const subject = Wallet.createRandom().address;
    const assessmentStandard = 'ISO 9001';
    const issueDate = new Date();
    const validFrom = new Date(new Date().setDate(new Date().getDate() + 1));
    const validUntil = new Date(new Date().setDate(new Date().getDate() + 30));
    const processTypes = ['type1', 'type2'];
    const document: CertificateDocument = {
        fileName: 'document.pdf',
        documentType: DocumentType.CERTIFICATE_OF_CONFORMITY,
        fileContent: new Uint8Array([1, 2, 3, 4]),
        documentReferenceId: '1234'
    };
    const urlStructure: URLStructure = {
        prefix: 'prefix',
        organizationId: 1
    };
    const resourceSpec: ICPResourceSpec = {
        name: 'document.pdf',
        type: 'application/pdf'
    };

    const certificateManagerService = new CertificateManagerService(
        mockedCertificateManagerDriver,
        mockedDocumentDriver,
        mockedIcpFileDriver
    );

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerCompanyCertificate',
            serviceFunction: () =>
                certificateManagerService.registerCompanyCertificate(
                    roleProof,
                    issuer,
                    subject,
                    assessmentStandard,
                    issueDate,
                    validFrom,
                    validUntil,
                    document,
                    urlStructure,
                    resourceSpec
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.registerCompanyCertificate,
            expectedMockedFunctionArgs: [
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                {
                    documentType: document.documentType
                },
                issueDate,
                validFrom,
                validUntil
            ]
        },
        {
            serviceFunctionName: 'registerScopeCertificate',
            serviceFunction: () =>
                certificateManagerService.registerScopeCertificate(
                    roleProof,
                    issuer,
                    subject,
                    assessmentStandard,
                    issueDate,
                    validFrom,
                    validUntil,
                    processTypes,
                    document,
                    urlStructure,
                    resourceSpec
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.registerScopeCertificate,
            expectedMockedFunctionArgs: [
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                {
                    documentType: document.documentType
                },
                issueDate,
                validFrom,
                validUntil,
                processTypes
            ]
        },
        {
            serviceFunctionName: 'registerMaterialCertificate',
            serviceFunction: () =>
                certificateManagerService.registerMaterialCertificate(
                    roleProof,
                    issuer,
                    subject,
                    assessmentStandard,
                    issueDate,
                    3,
                    document,
                    urlStructure,
                    resourceSpec
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.registerMaterialCertificate,
            expectedMockedFunctionArgs: [
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                {
                    documentType: document.documentType
                },
                issueDate,
                3
            ]
        },
        {
            serviceFunctionName: 'getCertificateIdsBySubject',
            serviceFunction: () =>
                certificateManagerService.getCertificateIdsBySubject(roleProof, subject),
            expectedMockedFunction: mockedCertificateManagerDriver.getCertificateIdsBySubject,
            expectedMockedFunctionArgs: [roleProof, subject]
        },
        {
            serviceFunctionName: 'getBaseCertificatesInfoBySubject',
            serviceFunction: () =>
                certificateManagerService.getBaseCertificatesInfoBySubject(roleProof, subject),
            expectedMockedFunction: mockedCertificateManagerDriver.getBaseCertificatesInfoBySubject,
            expectedMockedFunctionArgs: [roleProof, subject]
        },
        {
            serviceFunctionName: 'getCompanyCertificates',
            serviceFunction: () =>
                certificateManagerService.getCompanyCertificates(roleProof, subject),
            expectedMockedFunction: mockedCertificateManagerDriver.getCompanyCertificates,
            expectedMockedFunctionArgs: [roleProof, subject]
        },
        {
            serviceFunctionName: 'getCompanyCertificate',
            serviceFunction: () => certificateManagerService.getCompanyCertificate(roleProof, 1),
            expectedMockedFunction: mockedCertificateManagerDriver.getCompanyCertificate,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getScopeCertificates',
            serviceFunction: () =>
                certificateManagerService.getScopeCertificates(roleProof, subject, processTypes[0]),
            expectedMockedFunction: mockedCertificateManagerDriver.getScopeCertificates,
            expectedMockedFunctionArgs: [roleProof, subject, processTypes[0]]
        },
        {
            serviceFunctionName: 'getScopeCertificate',
            serviceFunction: () => certificateManagerService.getScopeCertificate(roleProof, 1),
            expectedMockedFunction: mockedCertificateManagerDriver.getScopeCertificate,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getMaterialCertificates',
            serviceFunction: () =>
                certificateManagerService.getMaterialCertificates(roleProof, subject, 2),
            expectedMockedFunction: mockedCertificateManagerDriver.getMaterialCertificates,
            expectedMockedFunctionArgs: [roleProof, subject, 2]
        },
        {
            serviceFunctionName: 'getMaterialCertificate',
            serviceFunction: () => certificateManagerService.getMaterialCertificate(roleProof, 1),
            expectedMockedFunction: mockedCertificateManagerDriver.getMaterialCertificate,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'updateCompanyCertificate',
            serviceFunction: () =>
                certificateManagerService.updateCompanyCertificate(
                    roleProof,
                    1,
                    assessmentStandard,
                    issueDate,
                    validFrom,
                    validUntil
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.updateCompanyCertificate,
            expectedMockedFunctionArgs: [
                roleProof,
                1,
                assessmentStandard,
                issueDate,
                validFrom,
                validUntil
            ]
        },
        {
            serviceFunctionName: 'updateScopeCertificate',
            serviceFunction: () =>
                certificateManagerService.updateScopeCertificate(
                    roleProof,
                    1,
                    assessmentStandard,
                    issueDate,
                    validFrom,
                    validUntil,
                    processTypes
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.updateScopeCertificate,
            expectedMockedFunctionArgs: [
                roleProof,
                1,
                assessmentStandard,
                issueDate,
                validFrom,
                validUntil,
                processTypes
            ]
        },
        {
            serviceFunctionName: 'updateMaterialCertificate',
            serviceFunction: () =>
                certificateManagerService.updateMaterialCertificate(
                    roleProof,
                    1,
                    assessmentStandard,
                    issueDate,
                    3
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.updateMaterialCertificate,
            expectedMockedFunctionArgs: [roleProof, 1, assessmentStandard, issueDate, 3]
        },
        {
            serviceFunctionName: 'evaluateDocument',
            serviceFunction: () =>
                certificateManagerService.evaluateDocument(
                    roleProof,
                    2,
                    3,
                    DocumentEvaluationStatus.NOT_APPROVED
                ),
            expectedMockedFunction: mockedCertificateManagerDriver.evaluateDocument,
            expectedMockedFunctionArgs: [roleProof, 2, 3, DocumentEvaluationStatus.NOT_APPROVED]
        },
        {
            serviceFunctionName: 'getBaseCertificateInfoById',
            serviceFunction: () =>
                certificateManagerService.getBaseCertificateInfoById(roleProof, 1),
            expectedMockedFunction: mockedCertificateManagerDriver.getBaseCertificateInfoById,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => certificateManagerService.addAdmin('testAddress'),
            expectedMockedFunction: mockedCertificateManagerDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => certificateManagerService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedCertificateManagerDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );

    it('should register company certificate', async () => {
        await certificateManagerService.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            document,
            urlStructure,
            resourceSpec
        );

        expect(mockedCertificateManagerDriver.registerCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(mockedCertificateManagerDriver.registerCompanyCertificate).toHaveBeenNthCalledWith(
            1,
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            {
                documentType: document.documentType
            },
            issueDate,
            validFrom,
            validUntil
        );
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${URL_SEGMENTS.CERTIFICATION.COMPANY}`;
        expect(mockedIcpFileDriver.create).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            1,
            document.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            []
        );
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            2,
            FileHelpers.getBytesFromObject({
                fileName: document.fileName,
                documentType: document.documentType,
                documentReferenceId: document.documentReferenceId
            }),
            {
                name: `${baseExternalUrl}${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                type: 'application/json'
            },
            []
        );
    });

    it('should register scope certificate', async () => {
        await certificateManagerService.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            processTypes,
            document,
            urlStructure,
            resourceSpec
        );

        expect(mockedCertificateManagerDriver.registerScopeCertificate).toHaveBeenCalledTimes(1);
        expect(mockedCertificateManagerDriver.registerScopeCertificate).toHaveBeenNthCalledWith(
            1,
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            {
                documentType: document.documentType
            },
            issueDate,
            validFrom,
            validUntil,
            processTypes
        );
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${URL_SEGMENTS.CERTIFICATION.SCOPE}`;
        expect(mockedIcpFileDriver.create).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            1,
            document.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            []
        );
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            2,
            FileHelpers.getBytesFromObject({
                fileName: document.fileName,
                documentType: document.documentType,
                documentReferenceId: document.documentReferenceId
            }),
            {
                name: `${baseExternalUrl}${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                type: 'application/json'
            },
            []
        );
    });

    it('should register material certificate', async () => {
        await certificateManagerService.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            issueDate,
            3,
            document,
            urlStructure,
            resourceSpec
        );

        expect(mockedCertificateManagerDriver.registerMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(mockedCertificateManagerDriver.registerMaterialCertificate).toHaveBeenNthCalledWith(
            1,
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            {
                documentType: document.documentType
            },
            issueDate,
            3
        );
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${URL_SEGMENTS.CERTIFICATION.MATERIAL}3/`;
        expect(mockedIcpFileDriver.create).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            1,
            document.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            []
        );
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            2,
            FileHelpers.getBytesFromObject({
                fileName: document.fileName,
                documentType: document.documentType,
                documentReferenceId: document.documentReferenceId
            }),
            {
                name: `${baseExternalUrl}${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                type: 'application/json'
            },
            []
        );
    });

    it('should get a certificate document', async () => {
        mockedDocumentDriver.getDocumentById = jest.fn().mockResolvedValue({
            externalUrl: 'path/to/url/file.pdf'
        });
        mockedIcpFileDriver.read = jest.fn().mockResolvedValueOnce(
            FileHelpers.getBytesFromObject({
                filename: 'file.pdf',
                documentType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                documentReferenceId: '1234'
            })
        );
        await certificateManagerService.getDocument(roleProof, 1);

        expect(mockedDocumentDriver.getDocumentById).toHaveBeenCalledTimes(1);
        expect(mockedDocumentDriver.getDocumentById).toHaveBeenNthCalledWith(1, roleProof, 1);

        expect(mockedIcpFileDriver.read).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.read).toHaveBeenNthCalledWith(
            1,
            `path/to/url/file-metadata.json`
        );
        expect(mockedIcpFileDriver.read).toHaveBeenNthCalledWith(2, 'path/to/url/file.pdf');
    });

    it('should fail to get a certificate document', async () => {
        mockedDocumentDriver.getDocumentById = jest.fn().mockRejectedValueOnce(new Error('error'));
        await expect(certificateManagerService.getDocument(roleProof, 1)).rejects.toThrow(
            new Error('Error while retrieving document file from external storage: error')
        );
    });

    it('should update a document', async () => {
        mockedDocumentDriver.getDocumentById = jest.fn().mockResolvedValue({
            externalUrl: 'path/to/url/file.pdf'
        });
        await certificateManagerService.updateDocument(roleProof, 1, 2, document, resourceSpec);

        expect(mockedIcpFileDriver.create).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            1,
            document.fileContent,
            { ...resourceSpec, name: `path/to/url/${resourceSpec.name}` },
            []
        );
        expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
            2,
            FileHelpers.getBytesFromObject({
                fileName: document.fileName,
                documentType: document.documentType,
                documentReferenceId: document.documentReferenceId
            }),
            {
                name: `path/to/url/${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                type: 'application/json'
            },
            []
        );
    });
});
