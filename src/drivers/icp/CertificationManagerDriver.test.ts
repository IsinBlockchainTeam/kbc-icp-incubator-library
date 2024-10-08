import { Wallet } from 'ethers';
import { computeRoleProof } from './proof';
import { CertificationManagerDriver } from './CertificationManagerDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const CERTIFICATION_MANAGER_CANISTER_ID = process.env.CANISTER_ID_CERTIFICATION_MANAGER!;
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    certificationManagerDriver: CertificationManagerDriver;
    roleProof: RoleProof;
};

describe('CertificationManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const certificationManagerDriver = new CertificationManagerDriver(
            siweIdentityProvider.identity,
            CERTIFICATION_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyPrivateKey
        );
        return { userWallet, companyWallet, certificationManagerDriver, roleProof };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    }, 30000);

    it('should register company certificate', async () => {
        const {
            certificationManagerDriver,
            companyWallet: issuerCompanyWallet,
            roleProof
        } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const companyCertificate = await certificationManagerDriver.registerCompanyCertificate(
            roleProof,
            issuerCompanyWallet.address,
            subjectCompanyWallet.address,
            'standard1',
            {
                id: BigInt(1),
                docType: { CERTIFICATE_OF_CONFORMITY: null }
            },
            new Date(),
            new Date(new Date().setDate(new Date().getDate() + 365))
        );
        console.log(companyCertificate);
        expect(companyCertificate).toBeDefined();
    }, 30000);

    it('should register scope certificate', async () => {
        const {
            certificationManagerDriver,
            companyWallet: issuerCompanyWallet,
            roleProof
        } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const scopeCertificate = await certificationManagerDriver.registerScopeCertificate(
            roleProof,
            issuerCompanyWallet.address,
            subjectCompanyWallet.address,
            'standard2',
            {
                id: BigInt(1),
                docType: { PRODUCTION_REPORT: null }
            },
            new Date(),
            new Date(new Date().setDate(new Date().getDate() + 365)),
            ['processType1', 'processType2']
        );
        console.log(scopeCertificate);
        expect(scopeCertificate).toBeDefined();
    }, 30000);

    it('should register material certificate', async () => {
        const {
            certificationManagerDriver,
            companyWallet: issuerCompanyWallet,
            roleProof
        } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const materialCertificate = await certificationManagerDriver.registerMaterialCertificate(
            roleProof,
            issuerCompanyWallet.address,
            subjectCompanyWallet.address,
            'standard3',
            {
                id: BigInt(1),
                docType: { PRODUCTION_REPORT: null }
            },
            1
        );
        console.log(materialCertificate);
        expect(materialCertificate).toBeDefined();
    }, 30000);

    it('should retrieve company certificate', async () => {
        const { certificationManagerDriver, roleProof } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const companyCertificate = await certificationManagerDriver.getCompanyCertificate(
            roleProof,
            subjectCompanyWallet.address,
            0
        );
        console.log(companyCertificate);
        expect(companyCertificate).toBeDefined();
        const companyCertificates = await certificationManagerDriver.getCompanyCertificates(
            roleProof,
            subjectCompanyWallet.address
        );
        expect(companyCertificates.length).toBeGreaterThan(0);
    }, 30000);

    it('should retrieve scope certificate', async () => {
        const { certificationManagerDriver, roleProof } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const scopeCertificate = await certificationManagerDriver.getScopeCertificate(
            roleProof,
            subjectCompanyWallet.address,
            1
        );
        console.log(scopeCertificate);
        expect(scopeCertificate).toBeDefined();
    }, 30000);

    it('should retrieve material certificate', async () => {
        const { certificationManagerDriver, roleProof } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const materialCertificate = await certificationManagerDriver.getMaterialCertificate(
            roleProof,
            subjectCompanyWallet.address,
            2
        );
        console.log(materialCertificate);
        expect(materialCertificate).toBeDefined();
    }, 30000);

    it('should retrieve all certificates by subject', async () => {
        const { certificationManagerDriver, roleProof } = utils1;
        const { companyWallet: subjectCompanyWallet } = utils2;
        const certificates = await certificationManagerDriver.getBaseCertificatesInfoBySubject(
            roleProof,
            subjectCompanyWallet.address
        );
        console.log(certificates);
        expect(certificates.length).toEqual(3);
        expect(certificates[0].certType).toEqual({ COMPANY: null });
        expect(certificates[1].certType).toEqual({ SCOPE: null });
        expect(certificates[2].certType).toEqual({ MATERIAL: null });
    }, 30000);
});
