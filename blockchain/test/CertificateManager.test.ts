/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ContractName } from '../utils/constants';
import { KBCAccessControl } from '../typechain-types/contracts/MaterialManager';

describe('CertificateManager', () => {
    let certificateManagerContract: Contract;
    let processTypeManagerContractFake: FakeContract;
    let assessmentStandardManagerContractFake: FakeContract;
    let delegateManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    const assessmentStandards = ['Chemical use assessment', 'Environment assessment', 'Origin assessment'];

    let owner: SignerWithAddress, admin: SignerWithAddress, consignee: SignerWithAddress, issuer: SignerWithAddress, other: SignerWithAddress;
    const roleProof: KBCAccessControl.RoleProofStruct = {
        signedProof: '0x',
        delegator: ''
    };
    const issueDate = new Date().getTime(),
        validFrom = new Date().getTime(),
        validUntil = new Date().getTime();

    before(async () => {
        [owner, admin, consignee, issuer, other] = await ethers.getSigners();
        roleProof.delegator = owner.address;
    });

    beforeEach(async () => {
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);

        processTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        processTypeManagerContractFake.contains.returns((value: string) => processTypes.includes(value[0]));

        assessmentStandardManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        assessmentStandardManagerContractFake.contains.returns((value: string) => assessmentStandards.includes(value[0]));

        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        documentManagerContractFake.getDocumentExists.returns((args: any[]) => args[1].toNumber() !== 0);

        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((args: any[]) => args[1].toNumber() !== 0);

        const CertificateManager = await ethers.getContractFactory(ContractName.CERTIFICATE_MANAGER);
        certificateManagerContract = await CertificateManager.deploy(
            delegateManagerContractFake.address,
            processTypeManagerContractFake.address,
            assessmentStandardManagerContractFake.address,
            documentManagerContractFake.address,
            materialManagerContractFake.address
        );
        await certificateManagerContract.deployed();
    });

    describe('Company certificate', () => {
        describe('Register', () => {
            it('should register and get a company certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerCompanyCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[0],
                        { id: 1, documentType: 0 },
                        issueDate,
                        validFrom,
                        validUntil
                    );
                await tx.wait();

                const certificates = await certificateManagerContract.getCompanyCertificates(roleProof, consignee.address);
                expect(certificates.length).to.be.equal(1);
                expect(certificates[0].baseInfo.issuer).to.be.equal(issuer.address);
                expect(certificates[0].baseInfo.uploadedBy).to.be.equal(consignee.address);
                expect(certificates[0].baseInfo.subject).to.be.equal(consignee.address);
                expect(certificates[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[0]);
                expect(certificates[0].baseInfo.document.id).to.be.equal(1);
                expect(certificates[0].baseInfo.document.documentType).to.be.equal(0);
                expect(certificates[0].baseInfo.evaluationStatus).to.be.equal(0);
                expect(certificates[0].baseInfo.certificateType).to.be.equal(0);
                expect(certificates[0].baseInfo.issueDate).to.be.equal(issueDate);
                expect(certificates[0].validFrom).to.be.equal(validFrom);
                expect(certificates[0].validUntil).to.be.equal(validUntil);

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);
                const certificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
                expect(certificate).to.deep.equal(certificates[0]);
            });

            it('should register and get a company certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerCompanyCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            'custom standard',
                            { id: 1, documentType: 0 },
                            issueDate,
                            validFrom,
                            validUntil
                        )
                ).to.be.revertedWith('CertificateManager: Assessment standard does not exist');
            });

            it('should register and get a company certificate - FAIL (CertificateManager: Document does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerCompanyCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            assessmentStandards[0],
                            { id: 0, documentType: 0 },
                            issueDate,
                            validFrom,
                            validUntil
                        )
                ).to.be.revertedWith('CertificateManager: Document does not exist');
            });
        });

        describe('Update', () => {
            it('should update a company certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerCompanyCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[0],
                        { id: 1, documentType: 0 },
                        issueDate,
                        validFrom,
                        validUntil
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                const updateTx = await certificateManagerContract
                    .connect(consignee)
                    .updateCompanyCertificate(
                        roleProof,
                        certificateIds[0],
                        assessmentStandards[1],
                        issueDate,
                        new Date(new Date(validFrom).getDate() + 1).getTime(),
                        new Date(new Date(validUntil).getDate() + 1).getTime()
                    );
                await updateTx.wait();

                const updatedCertificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
                expect(updatedCertificate.baseInfo.assessmentStandard).to.be.equal(assessmentStandards[1]);
                expect(updatedCertificate.baseInfo.issueDate).to.be.equal(issueDate);
                expect(updatedCertificate.validFrom).to.be.equal(new Date(validFrom).getDate() + 1);
                expect(updatedCertificate.validUntil).to.be.equal(new Date(validUntil).getDate() + 1);
            });

            it('should update a company certificate - FAIL (CertificateManager: Only the uploader can update the certificate)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerCompanyCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[0],
                        { id: 1, documentType: 0 },
                        issueDate,
                        validFrom,
                        validUntil
                    );
                await tx.wait();
                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                await expect(
                    certificateManagerContract
                        .connect(issuer)
                        .updateCompanyCertificate(roleProof, certificateIds[0], assessmentStandards[1], issueDate, validFrom, validUntil)
                ).to.be.revertedWith('CertificateManager: Only the uploader can update the certificate');
            });

            it('should update a company certificate - FAIL (CertificateManager: Company certificate does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateCompanyCertificate(roleProof, 15, assessmentStandards[1], issueDate, validFrom, validUntil)
                ).to.be.revertedWith('CertificateManager: Company certificate does not exist');
            });

            it('should update a company certificate - FAIL (CertificateManager: Certificate has already been evaluated)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerCompanyCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[0],
                        { id: 1, documentType: 0 },
                        issueDate,
                        validFrom,
                        validUntil
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                await certificateManagerContract.evaluateDocument(roleProof, certificateIds[0], 1, 2);
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateCompanyCertificate(roleProof, certificateIds[0], assessmentStandards[1], issueDate, validFrom, validUntil)
                ).to.be.revertedWith('CertificateManager: Certificate has already been evaluated');
            });
        });
    });

    describe('Scope certificate', () => {
        describe('Register', () => {
            it('should register and get a scope certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerScopeCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[1],
                        { id: 2, documentType: 1 },
                        issueDate,
                        validFrom,
                        validUntil,
                        processTypes
                    );
                await tx.wait();

                const certificatesProcessType1 = await certificateManagerContract.getScopeCertificates(roleProof, consignee.address, processTypes[0]);
                expect(certificatesProcessType1.length).to.be.equal(1);
                expect(certificatesProcessType1[0].baseInfo.uploadedBy).to.be.equal(consignee.address);
                expect(certificatesProcessType1[0].baseInfo.issuer).to.be.equal(issuer.address);
                expect(certificatesProcessType1[0].baseInfo.subject).to.be.equal(consignee.address);
                expect(certificatesProcessType1[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[1]);
                expect(certificatesProcessType1[0].baseInfo.document.id).to.be.equal(2);
                expect(certificatesProcessType1[0].baseInfo.document.documentType).to.be.equal(1);
                expect(certificatesProcessType1[0].baseInfo.evaluationStatus).to.be.equal(0);
                expect(certificatesProcessType1[0].baseInfo.certificateType).to.be.equal(1);
                expect(certificatesProcessType1[0].baseInfo.issueDate).to.be.equal(issueDate);
                expect(certificatesProcessType1[0].validFrom).to.be.equal(validFrom);
                expect(certificatesProcessType1[0].validUntil).to.be.equal(validUntil);
                expect(certificatesProcessType1[0].processTypes).to.be.deep.equal(processTypes);

                const certificatesProcessType2 = await certificateManagerContract.getScopeCertificates(roleProof, consignee.address, processTypes[1]);
                expect(certificatesProcessType2.length).to.be.equal(1);
                expect(certificatesProcessType2[0]).to.deep.equal(certificatesProcessType1[0]);

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);
                const certificate = await certificateManagerContract.getScopeCertificate(roleProof, certificateIds[0]);
                expect(certificate).to.deep.equal(certificatesProcessType1[0]);
                expect(certificate).to.deep.equal(certificatesProcessType2[0]);
            });

            it('should register and get a scope certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerScopeCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            'custom standard',
                            { id: 2, documentType: 1 },
                            issueDate,
                            validFrom,
                            validUntil,
                            processTypes
                        )
                ).to.be.revertedWith('CertificateManager: Assessment standard does not exist');
            });

            it('should register and get a scope certificate - FAIL (CertificateManager: Document does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerScopeCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            assessmentStandards[1],
                            { id: 0, documentType: 1 },
                            issueDate,
                            validFrom,
                            validUntil,
                            processTypes
                        )
                ).to.be.revertedWith('CertificateManager: Document does not exist');
            });

            it('should register and get a scope certificate - FAIL (CertificateManager: Process type does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerScopeCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            assessmentStandards[1],
                            { id: 1, documentType: 1 },
                            issueDate,
                            validFrom,
                            validUntil,
                            ['custom process type']
                        )
                ).to.be.revertedWith('CertificateManager: Process type does not exist');
            });
        });

        describe('Update', () => {
            it('should update a scope certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerScopeCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[1],
                        { id: 2, documentType: 1 },
                        issueDate,
                        validFrom,
                        validUntil,
                        processTypes
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                const updateTx = await certificateManagerContract
                    .connect(consignee)
                    .updateScopeCertificate(
                        roleProof,
                        certificateIds[0],
                        assessmentStandards[1],
                        issueDate,
                        new Date(new Date(validFrom).getDate() + 1).getTime(),
                        new Date(new Date(validUntil).getDate() + 1).getTime(),
                        [processTypes[0]]
                    );
                await updateTx.wait();

                const updatedCertificate = await certificateManagerContract.getScopeCertificate(roleProof, certificateIds[0]);
                expect(updatedCertificate.baseInfo.assessmentStandard).to.be.equal(assessmentStandards[1]);
                expect(updatedCertificate.baseInfo.issueDate).to.be.equal(issueDate);
                expect(updatedCertificate.validFrom).to.be.equal(new Date(validFrom).getDate() + 1);
                expect(updatedCertificate.validUntil).to.be.equal(new Date(validUntil).getDate() + 1);
                expect(updatedCertificate.processTypes).to.be.deep.equal([processTypes[0]]);
            });

            it('should update a scope certificate - FAIL (CertificateManager: Only the uploader can update the certificate)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerScopeCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[1],
                        { id: 2, documentType: 1 },
                        issueDate,
                        validFrom,
                        validUntil,
                        processTypes
                    );
                await tx.wait();
                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                await expect(
                    certificateManagerContract
                        .connect(issuer)
                        .updateScopeCertificate(
                            roleProof,
                            certificateIds[0],
                            assessmentStandards[1],
                            issueDate,
                            new Date(new Date(validFrom).getDate() + 1).getTime(),
                            new Date(new Date(validUntil).getDate() + 1).getTime(),
                            [processTypes[0]]
                        )
                ).to.be.revertedWith('CertificateManager: Only the uploader can update the certificate');
            });

            it('should update a scope certificate - FAIL (CertificateManager: Scope certificate does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateScopeCertificate(
                            roleProof,
                            15,
                            assessmentStandards[1],
                            issueDate,
                            new Date(new Date(validFrom).getDate() + 1).getTime(),
                            new Date(new Date(validUntil).getDate() + 1).getTime(),
                            [processTypes[0]]
                        )
                ).to.be.revertedWith('CertificateManager: Scope certificate does not exist');
            });

            it('should update a scope certificate - FAIL (CertificateManager: Certificate has already been evaluated)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerScopeCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[1],
                        { id: 2, documentType: 1 },
                        issueDate,
                        validFrom,
                        validUntil,
                        processTypes
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                await certificateManagerContract.evaluateDocument(roleProof, certificateIds[0], 2, 1);
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateScopeCertificate(
                            roleProof,
                            certificateIds[0],
                            assessmentStandards[1],
                            issueDate,
                            new Date(new Date(validFrom).getDate() + 1).getTime(),
                            new Date(new Date(validUntil).getDate() + 1).getTime(),
                            [processTypes[0]]
                        )
                ).to.be.revertedWith('CertificateManager: Certificate has already been evaluated');
            });

            it('should update a scope certificate - FAIL (CertificateManager: Process type does not exist)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerScopeCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[1],
                        { id: 2, documentType: 1 },
                        issueDate,
                        validFrom,
                        validUntil,
                        processTypes
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateScopeCertificate(
                            roleProof,
                            certificateIds[0],
                            assessmentStandards[1],
                            issueDate,
                            new Date(new Date(validFrom).getDate() + 1).getTime(),
                            new Date(new Date(validUntil).getDate() + 1).getTime(),
                            [...processTypes, 'custom process type']
                        )
                ).to.be.revertedWith('CertificateManager: Process type does not exist');
            });
        });
    });

    describe('Material certificate', () => {
        describe('Register', () => {
            it('should register and get a material certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerMaterialCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[2],
                        { id: 2, documentType: 1 },
                        issueDate,
                        3
                    );
                await tx.wait();

                const certificates = await certificateManagerContract.getMaterialCertificates(roleProof, consignee.address, 3);
                expect(certificates.length).to.be.equal(1);
                expect(certificates[0].baseInfo.uploadedBy).to.be.equal(consignee.address);
                expect(certificates[0].baseInfo.issuer).to.be.equal(issuer.address);
                expect(certificates[0].baseInfo.subject).to.be.equal(consignee.address);
                expect(certificates[0].baseInfo.assessmentStandard).to.be.equal(assessmentStandards[2]);
                expect(certificates[0].baseInfo.document.id).to.be.equal(2);
                expect(certificates[0].baseInfo.document.documentType).to.be.equal(1);
                expect(certificates[0].baseInfo.evaluationStatus).to.be.equal(0);
                expect(certificates[0].baseInfo.certificateType).to.be.equal(2);
                expect(certificates[0].baseInfo.issueDate).to.be.equal(issueDate);
                expect(certificates[0].materialId).to.be.equal(3);

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);
                const certificate = await certificateManagerContract.getMaterialCertificate(roleProof, certificateIds[0]);
                expect(certificate).to.deep.equal(certificates[0]);
            });

            it('should register and get a material certificate - FAIL (CertificateManager: Material does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerMaterialCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            assessmentStandards[0],
                            { id: 2, documentType: 1 },
                            issueDate,
                            0
                        )
                ).to.be.revertedWith('CertificateManager: Material does not exist');
            });

            it('should register and get a material certificate - FAIL (CertificateManager: Assessment standard does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerMaterialCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            'custom standard',
                            { id: 2, documentType: 1 },
                            issueDate,
                            3
                        )
                ).to.be.revertedWith('CertificateManager: Assessment standard does not exist');
            });

            it('should register and get a material certificate - FAIL (CertificateManager: Document does not exist)', async () => {
                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .registerMaterialCertificate(
                            roleProof,
                            issuer.address,
                            consignee.address,
                            assessmentStandards[0],
                            { id: 0, documentType: 1 },
                            issueDate,
                            3
                        )
                ).to.be.revertedWith('CertificateManager: Document does not exist');
            });
        });

        describe('Update', () => {
            it('should update a material certificate', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerMaterialCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[2],
                        { id: 2, documentType: 1 },
                        issueDate,
                        3
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                const updateTx = await certificateManagerContract
                    .connect(consignee)
                    .updateMaterialCertificate(roleProof, certificateIds[0], assessmentStandards[1], issueDate, 4);
                await updateTx.wait();

                const updatedCertificate = await certificateManagerContract.getMaterialCertificate(roleProof, certificateIds[0]);
                expect(updatedCertificate.baseInfo.assessmentStandard).to.be.equal(assessmentStandards[1]);
                expect(updatedCertificate.baseInfo.issueDate).to.be.equal(issueDate);
                expect(updatedCertificate.materialId).to.be.equal(4);
            });

            it('should update a material certificate - FAIL (CertificateManager: Only the uploader can update the certificate)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerMaterialCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[2],
                        { id: 2, documentType: 1 },
                        issueDate,
                        3
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                await expect(
                    certificateManagerContract
                        .connect(issuer)
                        .updateMaterialCertificate(roleProof, certificateIds[0], assessmentStandards[1], issueDate, 3)
                ).to.be.revertedWith('CertificateManager: Only the uploader can update the certificate');
            });

            it('should update a material certificate - FAIL (CertificateManager: Material does not exist)', async () => {
                const tx = await certificateManagerContract
                    .connect(consignee)
                    .registerMaterialCertificate(
                        roleProof,
                        issuer.address,
                        consignee.address,
                        assessmentStandards[2],
                        { id: 2, documentType: 1 },
                        issueDate,
                        3
                    );
                await tx.wait();

                const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
                expect(certificateIds.length).to.be.equal(1);

                await expect(
                    certificateManagerContract
                        .connect(consignee)
                        .updateMaterialCertificate(roleProof, certificateIds[0], assessmentStandards[1], issueDate, 0)
                ).to.be.revertedWith('CertificateManager: Material does not exist');
            });
        });
    });

    describe('Base certificate', () => {
        it('should get a base certificate by id', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();

            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            expect(certificateIds.length).to.be.equal(1);

            const certificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
            const baseInfo = await certificateManagerContract.getBaseCertificateInfoById(roleProof, certificateIds[0]);
            expect(certificate.baseInfo).to.deep.equal(baseInfo);
        });

        it('should get base certificates by consignee address', async () => {
            let baseCertificates = await certificateManagerContract.getBaseCertificatesInfoBySubject(roleProof, consignee.address);
            expect(baseCertificates.length).to.be.equal(0);

            await certificateManagerContract.registerCompanyCertificate(
                roleProof,
                issuer.address,
                consignee.address,
                assessmentStandards[0],
                { id: 1, documentType: 0 },
                issueDate,
                validFrom,
                validUntil
            );
            baseCertificates = await certificateManagerContract.getBaseCertificatesInfoBySubject(roleProof, consignee.address);
            expect(baseCertificates.length).to.be.equal(1);

            await certificateManagerContract.registerScopeCertificate(
                roleProof,
                issuer.address,
                consignee.address,
                assessmentStandards[1],
                { id: 2, documentType: 1 },
                issueDate,
                validFrom,
                validUntil,
                processTypes
            );
            baseCertificates = await certificateManagerContract.getBaseCertificatesInfoBySubject(roleProof, consignee.address);
            expect(baseCertificates.length).to.be.equal(2);
            expect(baseCertificates[0].certificateType).to.be.equal(0);
            expect(baseCertificates[1].certificateType).to.be.equal(1);

            await certificateManagerContract.registerCompanyCertificate(
                roleProof,
                issuer.address,
                other.address,
                assessmentStandards[2],
                { id: 3, documentType: 1 },
                issueDate,
                validFrom,
                validUntil
            );
            expect((await certificateManagerContract.getBaseCertificatesInfoBySubject(roleProof, consignee.address)).length).not.to.be.equal(3);
            expect((await certificateManagerContract.getBaseCertificatesInfoBySubject(roleProof, other.address)).length).to.be.equal(1);
        });
    });

    describe('Document evaluation', () => {
        it('should evaluate document', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();

            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            expect(certificateIds.length).to.be.equal(1);

            await certificateManagerContract.evaluateDocument(roleProof, certificateIds[0], 1, 2);
            const certificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
            expect(certificate.baseInfo.evaluationStatus).to.be.equal(2);
        });

        it('should evaluate document - FAIL (CertificateManager: Evaluation status must be different from NOT_EVALUATED)', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();

            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await expect(certificateManagerContract.connect(issuer).evaluateDocument(roleProof, certificateIds[0], 1, 0)).to.be.revertedWith(
                'CertificateManager: Evaluation status must be different from NOT_EVALUATED'
            );
        });

        it('should evaluate document - FAIL (CertificateManager: Document does not match the certificate)', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();

            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await expect(certificateManagerContract.connect(issuer).evaluateDocument(roleProof, certificateIds[0], 3, 2)).to.be.revertedWith(
                'CertificateManager: Document does not match the certificate'
            );
        });

        it('should evaluate document - FAIL (CertificateManager: Document has already been evaluated)', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();

            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await certificateManagerContract.connect(other).evaluateDocument(roleProof, certificateIds[0], 1, 2);
            await expect(certificateManagerContract.connect(issuer).evaluateDocument(roleProof, certificateIds[0], 1, 2)).to.be.revertedWith(
                'CertificateManager: Document has already been evaluated'
            );
        });
    });

    describe('Document update', () => {
        it('should update a document', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();
            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await certificateManagerContract.connect(other).evaluateDocument(roleProof, certificateIds[0], 1, 2);
            let certificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
            expect(certificate.baseInfo.evaluationStatus).to.be.equal(2);

            await certificateManagerContract
                .connect(consignee)
                .updateDocument(roleProof, certificateIds[0], 1, 'new external url', 'content hash updated');
            certificate = await certificateManagerContract.getCompanyCertificate(roleProof, certificateIds[0]);
            expect(certificate.baseInfo.evaluationStatus).to.be.equal(0);
        });

        it('should update a document - FAIL (CertificateManager: Document does not match the certificate)', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();
            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await expect(
                certificateManagerContract
                    .connect(consignee)
                    .updateDocument(roleProof, certificateIds[0], 2, 'new external url', 'content hash updated')
            ).to.be.revertedWith('CertificateManager: Document does not match the certificate');
        });

        it('should update a document - FAIL (CertificateManager: Only the uploader can update the document)', async () => {
            const tx = await certificateManagerContract
                .connect(consignee)
                .registerCompanyCertificate(
                    roleProof,
                    issuer.address,
                    consignee.address,
                    assessmentStandards[0],
                    { id: 1, documentType: 0 },
                    issueDate,
                    validFrom,
                    validUntil
                );
            await tx.wait();
            const certificateIds = await certificateManagerContract.getCertificateIdsBySubject(roleProof, consignee.address);
            await expect(
                certificateManagerContract.connect(issuer).updateDocument(roleProof, certificateIds[0], 1, 'new external url', 'content hash updated')
            ).to.be.revertedWith('CertificateManager: Only the uploader can update the document');
        });
    });
});
