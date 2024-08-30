/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('AssetOperationManager', () => {
    let assertOperationManagerContract: Contract;
    let materialManagerContractFake: FakeContract;
    let processTypeManagerContractFake: FakeContract;
    let delegateManagerContractFake: FakeContract;
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    let admin: SignerWithAddress, other: SignerWithAddress;

    const roleProof: RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
        delegateCredentialIdHash: ethers.utils.formatBytes32String('delegateCredentialIdHash'),
        membershipProof: {
            signedProof: '0x',
            delegatorCredentialIdHash: ethers.utils.formatBytes32String('delegatorCredentialIdHash'),
            issuer: ''
        }
    };

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        roleProof.membershipProof.issuer = admin.address;
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns(true);
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        processTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        processTypeManagerContractFake.contains.returns((value: string) => processTypes.includes(value[0]));

        const AssetOperationManager = await ethers.getContractFactory(ContractName.ASSET_OPERATION_MANAGER);
        assertOperationManagerContract = await AssetOperationManager.deploy(
            delegateManagerContractFake.address,
            materialManagerContractFake.address,
            processTypeManagerContractFake.address
        );
        await assertOperationManagerContract.deployed();
    });

    describe('Register', () => {
        it('should register an AssetOperation', async () => {
            const previousAssetOperationCounter = await assertOperationManagerContract.getAssetOperationsCounter(roleProof);
            expect(previousAssetOperationCounter).to.be.equal(0);
            const tx = await assertOperationManagerContract.registerAssetOperation(
                roleProof,
                'testTransformation',
                [[1], [2]],
                3,
                '38.8951',
                '-77.0364',
                [processTypes[0]]
            );
            await tx.wait();

            const currentAssetOperationCounter = await assertOperationManagerContract.getAssetOperationsCounter(roleProof);
            expect(currentAssetOperationCounter).to.be.equal(1);

            const registeredTransformation = await assertOperationManagerContract.getAssetOperation(roleProof, 1);
            expect(registeredTransformation[0]).to.be.equal(BigNumber.from(1));
            expect(registeredTransformation[1]).to.be.equal('testTransformation');
            expect(registeredTransformation[2]).deep.equal([BigNumber.from(1), BigNumber.from(2)]);
            expect(registeredTransformation[3]).to.be.equal(BigNumber.from(3));
            expect(registeredTransformation[4]).to.be.equal('38.8951');
            expect(registeredTransformation[5]).to.be.equal('-77.0364');
            expect(registeredTransformation[6]).to.be.deep.equal([processTypes[0]]);
            expect(registeredTransformation[7]).to.be.equal(true);
            expect(await assertOperationManagerContract.getAssetOperationExists(roleProof, 1)).to.be.equal(true);
            await expect(tx)
                .to.emit(assertOperationManagerContract, 'AssetOperationRegistered')
                .withArgs(registeredTransformation[0], registeredTransformation[1], registeredTransformation[3]);
            expect(await assertOperationManagerContract.getAssetOperationType(roleProof, 1)).to.be.equal(1);

            expect(await assertOperationManagerContract.getAssetOperationIdsOfCreator(roleProof, admin.address)).deep.equal([BigNumber.from(1)]);
            expect(await assertOperationManagerContract.getAssetOperationIdsOfCreator(roleProof, other.address)).deep.equal([]);
        });

        it('should register a Consolidation', async () => {
            const tx = await assertOperationManagerContract.registerAssetOperation(
                roleProof,
                'testConsolidation',
                [[1]],
                [3],
                '38.8951',
                '-77.0364',
                processTypes
            );
            await tx.wait();

            const registeredConsolidation = await assertOperationManagerContract.getAssetOperation(roleProof, 1);
            expect(registeredConsolidation[0]).to.be.equal(BigNumber.from(1));
            expect(registeredConsolidation[1]).to.be.equal('testConsolidation');
            expect(registeredConsolidation[2]).deep.equal([BigNumber.from(1)]);
            expect(registeredConsolidation[3]).to.be.equal(BigNumber.from(3));
            expect(registeredConsolidation[4]).to.be.equal('38.8951');
            expect(registeredConsolidation[5]).to.be.equal('-77.0364');
            expect(registeredConsolidation[6]).to.be.deep.equal(processTypes);
            expect(registeredConsolidation[7]).to.be.equal(true);
            expect(await assertOperationManagerContract.getAssetOperationExists(roleProof, 1)).to.be.equal(true);
            await expect(tx)
                .to.emit(assertOperationManagerContract, 'AssetOperationRegistered')
                .withArgs(registeredConsolidation[0], registeredConsolidation[1], registeredConsolidation[3]);
            expect(await assertOperationManagerContract.getAssetOperationType(roleProof, 1)).to.be.equal(0);
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: Output material does not exist)', async () => {
            materialManagerContractFake.getMaterialExists.returns(false);
            await expect(
                assertOperationManagerContract.registerAssetOperation(
                    roleProof,
                    'testTransformation',
                    [[1], [2]],
                    15,
                    '38.8951',
                    '-77.0364',
                    processTypes
                )
            ).to.be.revertedWith('AssetOperationManager: Output material does not exist');
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: Input material does not exist)', async () => {
            materialManagerContractFake.getMaterialExists.returnsAtCall(0, true);
            materialManagerContractFake.getMaterialExists.returnsAtCall(1, false);
            await expect(
                assertOperationManagerContract.registerAssetOperation(
                    roleProof,
                    'testTransformation',
                    [[1], [15]],
                    3,
                    '38.8951',
                    '-77.0364',
                    processTypes
                )
            ).to.be.revertedWith('AssetOperationManager: Input material does not exist');
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: At least one process type must be specified)', async () => {
            await expect(
                assertOperationManagerContract.registerAssetOperation(roleProof, 'testTransformation', [[1], [2]], 3, '38.8951', '-77.0364', [])
            ).to.be.revertedWith('AssetOperationManager: At least one process type must be specified');
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: Process type does not exist)', async () => {
            await expect(
                assertOperationManagerContract.registerAssetOperation(roleProof, 'testTransformation', [[1], [2]], 3, '38.8951', '-77.0364', [
                    'custom process type'
                ])
            ).to.be.revertedWith('AssetOperationManager: Process type does not exist');
        });

        it('should get AssetOperation type - FAIL(AssetOperationManager: Asset operation does not exist)', async () => {
            await expect(assertOperationManagerContract.getAssetOperationType(roleProof, 1)).to.be.revertedWith(
                'AssetOperationManager: Asset operation does not exist'
            );
        });
    });

    describe('Update', () => {
        it('should update an AssetOperation', async () => {
            await assertOperationManagerContract.registerAssetOperation(roleProof, 'testTransformation', [[1], [2]], 3, '38.8951', '-77.0364', [
                processTypes[0]
            ]);
            const tx = await assertOperationManagerContract.updateAssetOperation(
                roleProof,
                1,
                'testTransformationUpdated',
                [[4], [5]],
                6,
                '46.003677',
                '8.951052',
                [processTypes[1]]
            );
            await tx.wait();

            const updatedTransformation = await assertOperationManagerContract.getAssetOperation(roleProof, 1);
            expect(updatedTransformation[0]).to.be.equal(BigNumber.from(1));
            expect(updatedTransformation[1]).to.be.equal('testTransformationUpdated');
            expect(updatedTransformation[2]).deep.equal([BigNumber.from(4), BigNumber.from(5)]);
            expect(updatedTransformation[3]).to.be.equal(BigNumber.from(6));
            expect(updatedTransformation[4]).to.be.equal('46.003677');
            expect(updatedTransformation[5]).to.be.equal('8.951052');
            expect(updatedTransformation[6]).to.be.deep.equal([processTypes[1]]);
            expect(updatedTransformation[7]).to.be.equal(true);
            expect(tx).to.emit(assertOperationManagerContract, 'AssetOperationUpdated').withArgs(updatedTransformation[0]);
        });
    });

    describe('Roles', () => {
        it('should add and remove admin roles', async () => {
            await assertOperationManagerContract.connect(admin).addAdmin(other.address);
            expect(await assertOperationManagerContract.hasRole(await assertOperationManagerContract.ADMIN_ROLE(), other.address)).to.equal(true);
            await assertOperationManagerContract.connect(admin).removeAdmin(other.address);
            expect(await assertOperationManagerContract.hasRole(await assertOperationManagerContract.ADMIN_ROLE(), other.address)).to.equal(false);
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(assertOperationManagerContract.connect(other).addAdmin(other.address)).to.be.revertedWith(
                'AssetOperationManager: Caller is not the admin'
            );
        });
    });
});
