/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ContractName } from '../utils/constants';

describe('CertificateManager', () => {
    let certificateManagerContract: Contract;
    let processTypeManagerContractFake: FakeContract;
    let assessmentStandardManagerContractFake: FakeContract;
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    const assessmentStandards = ['Chemical use assessment', 'Environment assessment', 'Origin assessment'];

    let admin: SignerWithAddress, other: SignerWithAddress, issuer: SignerWithAddress;
    const issueDate = new Date().getTime(), validFrom = new Date().getTime(), validUntil = new Date().getTime();

    beforeEach(async () => {
        [admin, other, issuer] = await ethers.getSigners();

        processTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        processTypeManagerContractFake.contains.returns((value: string) => processTypes.includes(value[0]));

        assessmentStandardManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        assessmentStandardManagerContractFake.contains.returns((value: string) => assessmentStandards.includes(value[0]));

        const CertificateManager = await ethers.getContractFactory(ContractName.CERTIFICATE_MANAGER);
        certificateManagerContract = await CertificateManager.deploy(processTypeManagerContractFake.address, assessmentStandardManagerContractFake.address);
        await certificateManagerContract.deployed();
    });

    describe('Company certificate', () => {
        it('should register a company certificate', async () => {
            const tx = await certificateManagerContract.connect(other).registerCompanyCertificate(issuer.address, other.address, assessmentStandards[0], 1, issueDate, validFrom, validUntil);
            await tx.wait();

            const certificates = await certificateManagerContract.getCompanyCertificates(other.address);
            expect(certificates.length).to.be.equal(1);
            expect(certificates[0].baseInfo.issuer).to.be.equal(issuer.address);
            expect(certificates[0].company).to.be.equal(other.address);
            expect(certificates[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[0]);
            expect(certificates[0].baseInfo.documentId).to.be.equal(1);
            expect(certificates[0].baseInfo.issueDate).to.be.equal(issueDate);
            expect(certificates[0].validFrom).to.be.equal(validFrom);
            expect(certificates[0].validUntil).to.be.equal(validUntil);
        });

        it('should register a company certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
            await expect(certificateManagerContract.connect(other).registerCompanyCertificate(issuer.address, other.address, 'standard 1', 1, issueDate, validFrom, validUntil))
                .to.be.revertedWith('CertificateManager: Assessment standard does not exist');
        });
    });

    describe('Scope certificate', () => {
        it('should register a scope certificate', async () => {
            const tx = await certificateManagerContract.connect(other).registerScopeCertificate(issuer.address, other.address, assessmentStandards[1], 1, issueDate, validFrom, validUntil, processTypes);
            await tx.wait();

            const certificatesProcessType1 = await certificateManagerContract.getScopeCertificates(other.address, processTypes[0]);
            expect(certificatesProcessType1.length).to.be.equal(1);
            expect(certificatesProcessType1[0].baseInfo.issuer).to.be.equal(issuer.address);
            expect(certificatesProcessType1[0].company).to.be.equal(other.address);
            expect(certificatesProcessType1[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[1]);
            expect(certificatesProcessType1[0].baseInfo.documentId).to.be.equal(1);
            expect(certificatesProcessType1[0].baseInfo.issueDate).to.be.equal(issueDate);
            expect(certificatesProcessType1[0].validFrom).to.be.equal(validFrom);
            expect(certificatesProcessType1[0].validUntil).to.be.equal(validUntil);
            expect(certificatesProcessType1[0].processTypes).to.be.deep.equal(processTypes);

            const certificatesProcessType2 = await certificateManagerContract.getScopeCertificates(other.address, processTypes[1]);
            expect(certificatesProcessType2.length).to.be.equal(1);
            expect(certificatesProcessType2[0]).to.deep.equal(certificatesProcessType1[0]);
        });

        it('should register a scope certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
            await expect(certificateManagerContract.connect(other).registerScopeCertificate(issuer.address, other.address, 'standard 2', 1, issueDate, validFrom, validUntil, processTypes))
                .to.be.revertedWith('CertificateManager: Assessment standard does not exist');
        });

        it('should register a scope certificate - FAIL (CertificateManager: Process type does not exist)', async () => {
            await expect(certificateManagerContract.connect(other).registerScopeCertificate(issuer.address, other.address, assessmentStandards[1], 1, issueDate, validFrom, validUntil, ['process type 1']))
                .to.be.revertedWith('CertificateManager: Process type does not exist');
        });
    });

    describe('Material certificate', () => {
        it('should register a material certificate', async () => {
            const tx = await certificateManagerContract.connect(other).registerMaterialCertificate(issuer.address, assessmentStandards[2], 1, issueDate, 2, 3);
            await tx.wait();

            const certificates = await certificateManagerContract.getMaterialCertificates(2, 3);
            expect(certificates.length).to.be.equal(1);
            expect(certificates[0].baseInfo.issuer).to.be.equal(issuer.address);
            expect(certificates[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[2]);
            expect(certificates[0].baseInfo.documentId).to.be.equal(1);
            expect(certificates[0].baseInfo.issueDate).to.be.equal(issueDate);
            expect(certificates[0].tradeId).to.be.equal(2);
            expect(certificates[0].lineId).to.be.equal(3);
        });

        it('should register a material certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
            await expect(certificateManagerContract.connect(other).registerMaterialCertificate(issuer.address, 'standard 3', 1, issueDate, validFrom, validUntil))
                .to.be.revertedWith('CertificateManager: Assessment standard does not exist');
        });
    });
});
