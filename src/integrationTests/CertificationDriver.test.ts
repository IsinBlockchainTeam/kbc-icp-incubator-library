import { Wallet } from 'ethers';
import { CertificationDriver } from '../drivers/CertificationDriver';
import { SiweIdentityProvider } from '../drivers/SiweIdentityProvider';
import { AuthenticationDriver } from '../drivers/AuthenticationDriver';
import { createRoleProof } from '../__testUtils__/proof';
import { EvaluationStatus } from '../entities/Evaluation';
import {
    CertificateDocumentInfo,
    CertificateDocumentType,
    CertificateType
} from '../entities/Certificate';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.CANISTER_ID_ENTITY_MANAGER!;
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    certificationManagerDriver: CertificationDriver;
    authenticate: () => Promise<void>;
};

describe('CertificationManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    const assessmentStandards = [
        'Chemical use assessment',
        'Environment assessment',
        'Origin assessment',
        'Quality assessment',
        'Swiss Decode'
    ];
    const assessmentAssuranceLevels = [
        'Certified (Third Party)',
        'Reviewed by peer members',
        'Self assessed',
        'Self declaration / Not verified',
        'Verified by second party'
    ];

    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const certificationManagerDriver = new CertificationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, certificationManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    }, 30000);

    describe('Register certificates', () => {
        it('should register company certificate', async () => {
            const {
                certificationManagerDriver,
                companyWallet: issuerCompanyWallet,
                authenticate
            } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const companyCertificate = await certificationManagerDriver.registerCompanyCertificate(
                issuerCompanyWallet.address,
                subjectCompanyWallet.address,
                assessmentStandards[1],
                assessmentAssuranceLevels[0],
                {
                    referenceId: '123456',
                    documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                    externalUrl: 'externalUrl',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 365))
            );
            expect(companyCertificate).toBeDefined();
        }, 30000);

        it('should register scope certificate', async () => {
            const {
                certificationManagerDriver,
                companyWallet: issuerCompanyWallet,
                authenticate
            } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const scopeCertificate = await certificationManagerDriver.registerScopeCertificate(
                issuerCompanyWallet.address,
                subjectCompanyWallet.address,
                assessmentStandards[3],
                assessmentAssuranceLevels[2],
                {
                    referenceId: '123456',
                    documentType: CertificateDocumentType.PRODUCTION_REPORT,
                    externalUrl: 'externalUrl',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 365)),
                processTypes
            );
            expect(scopeCertificate).toBeDefined();
        }, 30000);

        it('should register material certificate', async () => {
            const {
                certificationManagerDriver,
                companyWallet: issuerCompanyWallet,
                authenticate
            } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const materialCertificate =
                await certificationManagerDriver.registerMaterialCertificate(
                    issuerCompanyWallet.address,
                    subjectCompanyWallet.address,
                    assessmentStandards[0],
                    assessmentAssuranceLevels[3],
                    {
                        referenceId: '123456',
                        documentType: CertificateDocumentType.PRODUCTION_REPORT,
                        externalUrl: 'externalUrl',
                        metadata: {
                            filename: 'file.pdf',
                            fileType: 'application/pdf'
                        }
                    },
                    1
                );
            expect(materialCertificate).toBeDefined();
        }, 30000);
    });

    describe('Get certificates', () => {
        it('should retrieve company certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const companyCertificates = await certificationManagerDriver.getCompanyCertificates(
                subjectCompanyWallet.address
            );
            expect(companyCertificates.length).toBeGreaterThan(0);
            const companyCertificate = await certificationManagerDriver.getCompanyCertificate(
                subjectCompanyWallet.address,
                Number(companyCertificates[companyCertificates.length - 1].id)
            );
            expect(companyCertificate).toBeDefined();
        }, 30000);

        it('should retrieve scope certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const scopeCertificates = await certificationManagerDriver.getScopeCertificates(
                subjectCompanyWallet.address
            );
            expect(scopeCertificates.length).toBeGreaterThan(0);
            const scopeCertificate = await certificationManagerDriver.getScopeCertificate(
                subjectCompanyWallet.address,
                Number(scopeCertificates[scopeCertificates.length - 1].id)
            );
            expect(scopeCertificate).toBeDefined();
        }, 30000);

        it('should retrieve material certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const materialCertificates = await certificationManagerDriver.getMaterialCertificates(
                subjectCompanyWallet.address
            );
            expect(materialCertificates.length).toBeGreaterThan(0);
            const materialCertificate = await certificationManagerDriver.getMaterialCertificate(
                subjectCompanyWallet.address,
                Number(materialCertificates[materialCertificates.length - 1].id)
            );
            expect(materialCertificate).toBeDefined();
        }, 30000);

        it('should retrieve all certificates by subject', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const certificates = await certificationManagerDriver.getBaseCertificatesInfoBySubject(
                subjectCompanyWallet.address
            );
            expect(certificates.length).toBeGreaterThan(0);
            const companyCertificates = await certificationManagerDriver.getCompanyCertificates(
                subjectCompanyWallet.address
            );
            const scopeCertificates = await certificationManagerDriver.getScopeCertificates(
                subjectCompanyWallet.address
            );
            const materialCertificates = await certificationManagerDriver.getMaterialCertificates(
                subjectCompanyWallet.address
            );
            expect(certificates.length).toEqual(
                companyCertificates.length + scopeCertificates.length + materialCertificates.length
            );
            expect(
                certificates.filter((c) => c.certificateType === CertificateType.COMPANY).length
            ).toEqual(companyCertificates.length);
            expect(
                certificates.filter((c) => c.certificateType === CertificateType.SCOPE).length
            ).toEqual(scopeCertificates.length);
            expect(
                certificates.filter((c) => c.certificateType === CertificateType.MATERIAL).length
            ).toEqual(materialCertificates.length);
        }, 30000);
    });

    describe('Update certificates', () => {
        it('should update company certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const companyCertificates = await certificationManagerDriver.getCompanyCertificates(
                subjectCompanyWallet.address
            );
            expect(companyCertificates.length).toBeGreaterThan(0);
            const lastCompanyCertificateId = Number(
                companyCertificates[companyCertificates.length - 1].id
            );
            const companyCertificate = await certificationManagerDriver.updateCompanyCertificate(
                lastCompanyCertificateId,
                assessmentStandards[1],
                assessmentAssuranceLevels[0],
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 365))
            );
            expect(companyCertificate).toBeDefined();
            expect(companyCertificate.assessmentStandard).toEqual(assessmentStandards[1]);
            const updatedCompanyCertificate =
                await certificationManagerDriver.getCompanyCertificate(
                    subjectCompanyWallet.address,
                    lastCompanyCertificateId
                );
            expect(updatedCompanyCertificate).toEqual(companyCertificate);
        }, 30000);

        it('should update scope certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const updatedValidUntil = new Date(new Date().setDate(new Date().getDate() + 2));
            const scopeCertificates = await certificationManagerDriver.getScopeCertificates(
                subjectCompanyWallet.address
            );
            expect(scopeCertificates.length).toBeGreaterThan(0);
            const lastScopeCertificateId = Number(
                scopeCertificates[scopeCertificates.length - 1].id
            );
            const scopeCertificate = await certificationManagerDriver.updateScopeCertificate(
                lastScopeCertificateId,
                assessmentStandards[3],
                assessmentAssuranceLevels[2],
                new Date(),
                updatedValidUntil,
                processTypes
            );
            expect(scopeCertificate).toBeDefined();
            expect(scopeCertificate.validUntil).toEqual(BigInt(updatedValidUntil.getTime()));
            const updatedScopeCertificate = await certificationManagerDriver.getScopeCertificate(
                subjectCompanyWallet.address,
                lastScopeCertificateId
            );
            expect(updatedScopeCertificate).toEqual(scopeCertificate);
        }, 30000);

        it('should update material certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const materialCertificates = await certificationManagerDriver.getMaterialCertificates(
                subjectCompanyWallet.address
            );
            expect(materialCertificates.length).toBeGreaterThan(0);
            const lastMaterialCertificateId = Number(
                materialCertificates[materialCertificates.length - 1].id
            );
            const materialCertificate = await certificationManagerDriver.updateMaterialCertificate(
                lastMaterialCertificateId,
                assessmentStandards[3],
                assessmentAssuranceLevels[4],
                1
            );
            expect(materialCertificate).toBeDefined();
            expect(materialCertificate.assessmentStandard).toEqual(assessmentStandards[3]);
            const updatedMaterialCertificate =
                await certificationManagerDriver.getMaterialCertificate(
                    subjectCompanyWallet.address,
                    lastMaterialCertificateId
                );
            expect(updatedMaterialCertificate).toEqual(materialCertificate);
        }, 30000);

        it('should update certificate document', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const document: CertificateDocumentInfo = {
                referenceId: '123456',
                documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                externalUrl: 'externalUrl',
                metadata: {
                    filename: 'file1.pdf',
                    fileType: 'application/pdf'
                }
            };
            const updatedDocument: CertificateDocumentInfo = {
                referenceId: '567890',
                documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
                externalUrl: 'externalUrl',
                metadata: {
                    filename: 'file2.pdf',
                    fileType: 'application/pdf'
                }
            };
            const companyCertificate = await certificationManagerDriver.registerCompanyCertificate(
                subjectCompanyWallet.address,
                subjectCompanyWallet.address,
                assessmentStandards[1],
                assessmentAssuranceLevels[0],
                document,
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 365))
            );
            expect(companyCertificate).toBeDefined();
            await certificationManagerDriver.updateDocument(companyCertificate.id, updatedDocument);
            const updatedCompanyCertificate =
                await certificationManagerDriver.getCompanyCertificate(
                    subjectCompanyWallet.address,
                    companyCertificate.id
                );
            expect(updatedCompanyCertificate).toBeDefined();
            expect(updatedCompanyCertificate.document).toEqual(updatedDocument);
        }, 30000);
    });

    describe('Evaluations', () => {
        it('should evaluate a scope certificate', async () => {
            const { certificationManagerDriver, authenticate } = utils1;
            const { companyWallet: subjectCompanyWallet } = utils2;
            await authenticate();

            const scopeCertificates = await certificationManagerDriver.getScopeCertificates(
                subjectCompanyWallet.address
            );
            expect(scopeCertificates.length).toBeGreaterThan(0);
            const lastScopeCertificateId = Number(
                scopeCertificates[scopeCertificates.length - 1].id
            );
            const scopeCertificate = await certificationManagerDriver.getScopeCertificate(
                subjectCompanyWallet.address,
                lastScopeCertificateId
            );
            expect(scopeCertificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
            await certificationManagerDriver.evaluateDocument(
                lastScopeCertificateId,
                EvaluationStatus.APPROVED
            );
            const evaluatedScopeCertificate = await certificationManagerDriver.getScopeCertificate(
                subjectCompanyWallet.address,
                lastScopeCertificateId
            );
            expect(evaluatedScopeCertificate.evaluationStatus).toEqual(EvaluationStatus.APPROVED);
        }, 30000);
    });
});
