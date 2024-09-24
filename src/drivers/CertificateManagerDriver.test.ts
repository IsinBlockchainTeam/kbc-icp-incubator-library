import { createMock } from 'ts-auto-mock';
import { BigNumber, ethers, Signer, Wallet } from 'ethers';
import { CertificateManager, CertificateManager__factory } from '../smart-contracts';
import { CertificateManagerDriver } from './CertificateManagerDriver';
import { RoleProof } from '../types/RoleProof';
import {
    CertificateDocumentInfo,
    DocumentEvaluationStatus,
    DocumentType
} from '../entities/Certificate';
import { EntityBuilder } from '../utils/EntityBuilder';

describe('CertificateManagerDriver', () => {
    let mockedSigner: Signer;
    let certificateManagerDriver: CertificateManagerDriver;
    const contractAddress: string = Wallet.createRandom().address;
    const roleProof: RoleProof = createMock<RoleProof>();
    const issuer: string = Wallet.createRandom().address;
    const subject: string = Wallet.createRandom().address;
    const assessmentStandard: string = 'assessmentStandard';
    const document: CertificateDocumentInfo = {
        id: 1,
        documentType: DocumentType.CERTIFICATE_OF_CONFORMITY
    };
    const issueDate = new Date().getTime();
    const validFrom = new Date(new Date().setDate(new Date().getDate() + 1)).getTime();
    const validUntil = new Date(new Date().setDate(new Date().getDate() + 365)).getTime();
    const processTypes: string[] = ['processType1', 'processType2'];
    const materialId: number = 3;
    const errorMessage = 'testError';

    const mockedCertificateManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn().mockResolvedValue({
        wait: mockedWait
    });
    const mockedReadFunction = jest.fn();

    const mockedContract = createMock<CertificateManager>({
        registerCompanyCertificate: mockedWriteFunction,
        registerScopeCertificate: mockedWriteFunction,
        registerMaterialCertificate: mockedWriteFunction,
        getCompanyCertificate: mockedReadFunction,
        getScopeCertificate: mockedReadFunction,
        getMaterialCertificate: mockedReadFunction,
        getCompanyCertificates: mockedReadFunction,
        getScopeCertificates: mockedReadFunction,
        getMaterialCertificates: mockedReadFunction,
        getCertificateIdsBySubject: mockedReadFunction,
        getBaseCertificatesInfoBySubject: mockedReadFunction,
        updateCompanyCertificate: mockedWriteFunction,
        updateScopeCertificate: mockedWriteFunction,
        updateMaterialCertificate: mockedWriteFunction,
        evaluateDocument: mockedWriteFunction,
        updateDocument: mockedWriteFunction,
        getBaseCertificateInfoById: mockedReadFunction,
        addAdmin: mockedWriteFunction,
        removeAdmin: mockedWriteFunction
    });

    beforeAll(() => {
        mockedCertificateManagerConnect.mockReturnValue(mockedContract);
        const mockedCertificateManager = createMock<CertificateManager>({
            connect: mockedCertificateManagerConnect
        });

        jest.spyOn(CertificateManager__factory, 'connect').mockReturnValue(
            mockedCertificateManager
        );
        mockedSigner = createMock<Signer>();
        certificateManagerDriver = new CertificateManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly register a company certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'CompanyCertificateRegistered',
                    args: [{ id: BigNumber.from(1) }]
                }
            ]
        });
        await certificateManagerDriver.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            validFrom,
            validUntil
        );
        expect(mockedContract.registerCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerCompanyCertificate).toHaveBeenCalledWith(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            validFrom,
            validUntil
        );
    });

    it('should fail to register a company certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined
        });
        await expect(
            certificateManagerDriver.registerCompanyCertificate(
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                document,
                issueDate,
                validFrom,
                validUntil
            )
        ).rejects.toThrow('Error during company certificate registration, no events found');
    });

    it('should correctly register a scope certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'ScopeCertificateRegistered',
                    args: [{ id: BigNumber.from(1) }]
                }
            ]
        });
        await certificateManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            validFrom,
            validUntil,
            processTypes
        );
        expect(mockedContract.registerScopeCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerScopeCertificate).toHaveBeenCalledWith(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            validFrom,
            validUntil,
            processTypes
        );
    });

    it('should fail to register a scope certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined
        });
        await expect(
            certificateManagerDriver.registerScopeCertificate(
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                document,
                issueDate,
                validFrom,
                validUntil,
                processTypes
            )
        ).rejects.toThrow('Error during scope certificate registration, no events found');
    });

    it('should correctly register a material certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'MaterialCertificateRegistered',
                    args: [{ id: BigNumber.from(1) }]
                }
            ]
        });
        await certificateManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            materialId
        );
        expect(mockedContract.registerMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerMaterialCertificate).toHaveBeenCalledWith(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            materialId
        );
    });

    it('should fail to register a material certificate', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined
        });
        await expect(
            certificateManagerDriver.registerMaterialCertificate(
                roleProof,
                issuer,
                subject,
                assessmentStandard,
                document,
                issueDate,
                materialId
            )
        ).rejects.toThrow('Error during material certificate registration, no events found');
    });

    it('should correctly get certificate ids by consignee company', async () => {
        const certificateIds = [BigNumber.from(1), BigNumber.from(2)];
        mockedContract.getCertificateIdsBySubject = jest.fn().mockResolvedValue(certificateIds);
        const result = await certificateManagerDriver.getCertificateIdsBySubject(
            roleProof,
            subject
        );
        expect(mockedContract.getCertificateIdsBySubject).toHaveBeenCalledTimes(1);
        expect(mockedContract.getCertificateIdsBySubject).toHaveBeenCalledWith(roleProof, subject);
        expect(result).toEqual(certificateIds.map((id) => id.toNumber()));
    });

    it('should correctly get base certificates info by consignee company', async () => {
        const certificates = [
            {
                id: BigNumber.from(1),
                issuer,
                subject,
                assessmentStandard,
                document: {
                    id: BigNumber.from(document.id),
                    documentType: document.documentType
                },
                evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                issueDate: BigNumber.from(issueDate)
            } as CertificateManager.BaseInfoStructOutput
        ];
        mockedContract.getBaseCertificatesInfoBySubject = jest.fn().mockResolvedValue(certificates);
        const result = await certificateManagerDriver.getBaseCertificatesInfoBySubject(
            roleProof,
            subject
        );
        expect(mockedContract.getBaseCertificatesInfoBySubject).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseCertificatesInfoBySubject).toHaveBeenCalledWith(
            roleProof,
            subject
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(EntityBuilder.buildBaseCertificate(certificates[0]));
    });

    it('should correctly get company certificates', async () => {
        const certificates = [
            {
                baseInfo: {
                    id: BigNumber.from(2),
                    issuer,
                    subject,
                    assessmentStandard,
                    document: {
                        id: BigNumber.from(document.id),
                        documentType: document.documentType
                    },
                    evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                    certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                    issueDate: BigNumber.from(issueDate)
                },
                validFrom: BigNumber.from(validFrom),
                validUntil: BigNumber.from(validUntil)
            } as CertificateManager.CompanyCertificateStructOutput
        ];
        mockedContract.getCompanyCertificates = jest.fn().mockResolvedValue(certificates);
        const result = await certificateManagerDriver.getCompanyCertificates(roleProof, subject);
        expect(mockedContract.getCompanyCertificates).toHaveBeenCalledTimes(1);
        expect(mockedContract.getCompanyCertificates).toHaveBeenCalledWith(roleProof, subject);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(EntityBuilder.buildCompanyCertificate(certificates[0]));
    });

    it('should correctly retrieve a company certificate', async () => {
        const certificate = {
            baseInfo: {
                id: BigNumber.from(1),
                issuer,
                subject,
                assessmentStandard,
                document: {
                    id: BigNumber.from(document.id),
                    documentType: document.documentType
                },
                evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                issueDate: BigNumber.from(issueDate)
            },
            validFrom: BigNumber.from(validFrom),
            validUntil: BigNumber.from(validUntil)
        } as CertificateManager.CompanyCertificateStructOutput;
        mockedContract.getCompanyCertificate = jest.fn().mockResolvedValue(certificate);
        const result = await certificateManagerDriver.getCompanyCertificate(roleProof, 1);
        expect(mockedContract.getCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.getCompanyCertificate).toHaveBeenCalledWith(roleProof, 1);
        expect(result).toEqual(EntityBuilder.buildCompanyCertificate(certificate));
    });

    it('should correctly get scope certificates', async () => {
        const certificates = [
            {
                baseInfo: {
                    id: BigNumber.from(2),
                    issuer,
                    subject,
                    assessmentStandard,
                    document: {
                        id: BigNumber.from(document.id),
                        documentType: document.documentType
                    },
                    evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                    certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                    issueDate: BigNumber.from(issueDate)
                },
                validFrom: BigNumber.from(validFrom),
                validUntil: BigNumber.from(validUntil),
                processTypes
            } as CertificateManager.ScopeCertificateStructOutput
        ];
        mockedContract.getScopeCertificates = jest.fn().mockResolvedValue(certificates);
        const result = await certificateManagerDriver.getScopeCertificates(
            roleProof,
            subject,
            processTypes[0]
        );
        expect(mockedContract.getScopeCertificates).toHaveBeenCalledTimes(1);
        expect(mockedContract.getScopeCertificates).toHaveBeenCalledWith(
            roleProof,
            subject,
            processTypes[0]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(EntityBuilder.buildScopeCertificate(certificates[0]));
    });

    it('should correctly get a scope certificate', async () => {
        const certificate = {
            baseInfo: {
                id: BigNumber.from(1),
                issuer,
                subject,
                assessmentStandard,
                document: {
                    id: BigNumber.from(document.id),
                    documentType: document.documentType
                },
                evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                issueDate: BigNumber.from(issueDate)
            },
            validFrom: BigNumber.from(validFrom),
            validUntil: BigNumber.from(validUntil),
            processTypes
        } as CertificateManager.ScopeCertificateStructOutput;
        mockedContract.getScopeCertificate = jest.fn().mockResolvedValue(certificate);
        const result = await certificateManagerDriver.getScopeCertificate(roleProof, 1);
        expect(mockedContract.getScopeCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.getScopeCertificate).toHaveBeenCalledWith(roleProof, 1);
        expect(result).toEqual(EntityBuilder.buildScopeCertificate(certificate));
    });

    it('should correctly get material certificates', async () => {
        const certificates = [
            {
                baseInfo: {
                    id: BigNumber.from(2),
                    issuer,
                    subject,
                    assessmentStandard,
                    document: {
                        id: BigNumber.from(document.id),
                        documentType: document.documentType
                    },
                    evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                    certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                    issueDate: BigNumber.from(issueDate)
                },
                materialId: BigNumber.from(materialId)
            } as CertificateManager.MaterialCertificateStructOutput
        ];
        mockedContract.getMaterialCertificates = jest.fn().mockResolvedValue(certificates);
        const result = await certificateManagerDriver.getMaterialCertificates(
            roleProof,
            subject,
            materialId
        );
        expect(mockedContract.getMaterialCertificates).toHaveBeenCalledTimes(1);
        expect(mockedContract.getMaterialCertificates).toHaveBeenCalledWith(
            roleProof,
            subject,
            materialId
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(EntityBuilder.buildMaterialCertificate(certificates[0]));
    });

    it('should correctly get a material certificate', async () => {
        const certificate = {
            baseInfo: {
                id: BigNumber.from(1),
                issuer,
                subject,
                assessmentStandard,
                document: {
                    id: BigNumber.from(document.id),
                    documentType: document.documentType
                },
                evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
                certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
                issueDate: BigNumber.from(issueDate)
            },
            materialId: BigNumber.from(materialId)
        } as CertificateManager.MaterialCertificateStructOutput;
        mockedContract.getMaterialCertificate = jest.fn().mockResolvedValue(certificate);
        const result = await certificateManagerDriver.getMaterialCertificate(roleProof, 1);
        expect(mockedContract.getMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.getMaterialCertificate).toHaveBeenCalledWith(roleProof, 1);
        expect(result).toEqual(EntityBuilder.buildMaterialCertificate(certificate));
    });

    it('should correctly update a company certificate', async () => {
        await certificateManagerDriver.updateCompanyCertificate(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            document.documentType
        );
        expect(mockedContract.updateCompanyCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateCompanyCertificate).toHaveBeenCalledWith(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            document.documentType
        );
    });

    it('should fail to update a company certificate', async () => {
        mockedContract.updateCompanyCertificate = jest
            .fn()
            .mockRejectedValueOnce(new Error(errorMessage));
        await expect(
            certificateManagerDriver.updateCompanyCertificate(
                roleProof,
                1,
                assessmentStandard,
                issueDate,
                validFrom,
                validUntil,
                document.documentType
            )
        ).rejects.toThrow(errorMessage);
    });

    it('should correctly update a scope certificate', async () => {
        await certificateManagerDriver.updateScopeCertificate(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            processTypes,
            document.documentType
        );
        expect(mockedContract.updateScopeCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateScopeCertificate).toHaveBeenCalledWith(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            document.documentType,
            processTypes
        );
    });

    it('should fail to update a scope certificate', async () => {
        mockedContract.updateScopeCertificate = jest
            .fn()
            .mockRejectedValueOnce(new Error(errorMessage));
        await expect(
            certificateManagerDriver.updateScopeCertificate(
                roleProof,
                1,
                assessmentStandard,
                issueDate,
                validFrom,
                validUntil,
                processTypes,
                document.documentType
            )
        ).rejects.toThrow(errorMessage);
    });

    it('should correctly update a material certificate', async () => {
        await certificateManagerDriver.updateMaterialCertificate(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            materialId,
            document.documentType
        );
        expect(mockedContract.updateMaterialCertificate).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateMaterialCertificate).toHaveBeenCalledWith(
            roleProof,
            1,
            assessmentStandard,
            issueDate,
            materialId,
            document.documentType
        );
    });

    it('should fail to update a material certificate', async () => {
        mockedContract.updateMaterialCertificate = jest
            .fn()
            .mockRejectedValueOnce(new Error(errorMessage));
        await expect(
            certificateManagerDriver.updateMaterialCertificate(
                roleProof,
                1,
                assessmentStandard,
                issueDate,
                materialId,
                document.documentType
            )
        ).rejects.toThrow(errorMessage);
    });

    it('should correctly evaluate a document', async () => {
        await certificateManagerDriver.evaluateDocument(
            roleProof,
            1,
            3,
            DocumentEvaluationStatus.APPROVED
        );
        expect(mockedContract.evaluateDocument).toHaveBeenCalledTimes(1);
        expect(mockedContract.evaluateDocument).toHaveBeenCalledWith(
            roleProof,
            1,
            3,
            DocumentEvaluationStatus.APPROVED
        );
    });

    it('should fail to evaluate a document', async () => {
        mockedContract.evaluateDocument = jest.fn().mockRejectedValueOnce(new Error(errorMessage));
        await expect(
            certificateManagerDriver.evaluateDocument(
                roleProof,
                1,
                3,
                DocumentEvaluationStatus.APPROVED
            )
        ).rejects.toThrow(errorMessage);
    });

    it('should correctly update a document', async () => {
        await certificateManagerDriver.updateDocument(
            roleProof,
            1,
            3,
            'externalUrl',
            'contentHash'
        );
        expect(mockedContract.updateDocument).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDocument).toHaveBeenCalledWith(
            roleProof,
            1,
            3,
            'externalUrl',
            'contentHash'
        );
    });

    it('should fail to update a document', async () => {
        mockedContract.updateDocument = jest.fn().mockRejectedValueOnce(new Error(errorMessage));
        await expect(
            certificateManagerDriver.updateDocument(roleProof, 1, 3, 'externalUrl', 'contentHash')
        ).rejects.toThrow(errorMessage);
    });

    it('should correctly get base certificate info by id', async () => {
        const certificate = {
            id: BigNumber.from(1),
            issuer,
            subject,
            assessmentStandard,
            document: {
                id: BigNumber.from(document.id),
                documentType: document.documentType
            },
            evaluationStatus: DocumentEvaluationStatus.NOT_EVALUATED,
            certificateType: DocumentType.CERTIFICATE_OF_CONFORMITY,
            issueDate: BigNumber.from(issueDate)
        } as CertificateManager.BaseInfoStructOutput;
        mockedContract.getBaseCertificateInfoById = jest.fn().mockResolvedValue(certificate);
        const result = await certificateManagerDriver.getBaseCertificateInfoById(roleProof, 1);
        expect(mockedContract.getBaseCertificateInfoById).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseCertificateInfoById).toHaveBeenCalledWith(roleProof, 1);
        expect(result).toEqual(EntityBuilder.buildBaseCertificate(certificate));
    });

    describe('addAdmin', () => {
        it('should call and wait for add admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await certificateManagerDriver.addAdmin(address);

            expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(1, address);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.addAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => certificateManagerDriver.addAdmin(address);
            await expect(fn).rejects.toThrow(new Error(errorMessage));
        });

        it('should call and wait for add admin - fails for address', async () => {
            const address = '123';

            const fn = async () => certificateManagerDriver.addAdmin(address);
            await expect(fn).rejects.toThrow(new Error('Not an address'));
        });
    });

    describe('removeAdmin', () => {
        it('should call and wait for remove admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await certificateManagerDriver.removeAdmin(address);

            expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(1, address);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for remove admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.removeAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => certificateManagerDriver.removeAdmin(address);
            await expect(fn).rejects.toThrow(new Error(errorMessage));
        });

        it('should call and wait for remove admin - fails for address', async () => {
            const address = '123';

            const fn = async () => certificateManagerDriver.removeAdmin(address);
            await expect(fn).rejects.toThrow(new Error('Not an address'));
        });
    });
});
