/* eslint-disable @typescript-eslint/no-shadow, import/no-extraneous-dependencies */
import { Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { KBCAccessControl } from '../typechain-types/contracts/MaterialManager';
import { ContractName } from '../utils/constants';

describe('EscrowManager.sol', () => {
    let escrowManagerContract: Contract;
    let delegateManagerContractFake: FakeContract;
    let tokenContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress, payer1: SignerWithAddress, other: SignerWithAddress, feeRecipient: SignerWithAddress;
    const depositAmount: number = 120;
    const duration: number = 60 * 60 * 24 * 30; // 30 days
    const baseFee: number = 20;
    const percentageFee: number = 1;

    const roleProof: KBCAccessControl.RoleProofStruct = {
        signedProof: '0x',
        delegator: ''
    };

    beforeEach(async () => {
        [admin, payee, payer1, other, feeRecipient] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy(delegateManagerContractFake.address, feeRecipient.address, baseFee, percentageFee);
        await escrowManagerContract.deployed();

        const Token = await ethers.getContractFactory('MyToken');
        tokenContract = await Token.deploy(depositAmount * 10);
        await tokenContract.deployed();
        await tokenContract.transfer(payer1.address, depositAmount * 2);
    });

    async function registerNewEscrow(payee: SignerWithAddress, duration: number): Promise<number> {
        const tx = await escrowManagerContract.registerEscrow(roleProof, admin.address, payee.address, duration, tokenContract.address);
        const receipt = await tx.wait();
        return receipt.events.find((event: Event) => event.event === 'EscrowRegistered').args.id.toNumber();
    }

    describe('EscrowManager creation', () => {
        it('should fail creating an escrow manager if fee recipient is the zero address', async () => {
            const EscrowManager = await ethers.getContractFactory('EscrowManager');
            await expect(
                EscrowManager.deploy(delegateManagerContractFake.address, ethers.constants.AddressZero, baseFee, percentageFee)
            ).to.be.revertedWith('EscrowManager: fee recipient is the zero address');
        });
        it('should fail creating an escrow manager if commissioner is percentageFee is greater than 100', async () => {
            const EscrowManager = await ethers.getContractFactory('EscrowManager');
            await expect(EscrowManager.deploy(delegateManagerContractFake.address, feeRecipient.address, baseFee, 101)).to.be.revertedWith(
                'EscrowManager: percentage fee cannot be greater than 100'
            );
        });
    });
    describe('Update', () => {
        it('should update fee recipient address', async () => {
            const id = await registerNewEscrow(payee, duration);

            const tx = await escrowManagerContract.updateFeeRecipient(other.address);
            expect(tx).to.emit(escrowManagerContract, 'FeeRecipientUpdated').withArgs(other.address);
            expect(await escrowManagerContract.getFeeRecipient(roleProof)).to.equal(other.address);

            const escrowAddress = await escrowManagerContract.getEscrow(roleProof, id);
            const escrowContract = await ethers.getContractAt('Escrow', escrowAddress);
            expect(await escrowContract.getFeeRecipient()).to.equal(other.address);
        });
        // TODO: fix this test
        // it('should not update fee recipient address for escrows with state not active', async () => {
        //     const firstEscrowId = await registerNewEscrow(payee, duration);
        //     const secondEscrowId = await registerNewEscrow(payee, duration);
        //
        //     // STATE: ACTIVE
        //     const firstEscrowAddress = await escrowManagerContract.getEscrow(roleProof, firstEscrowId);
        //     const firstEscrowContract = await ethers.getContractAt('Escrow', firstEscrowAddress);
        //
        //     // STATE: REFUNDING
        //     const secondEscrowAddress = await escrowManagerContract.getEscrow(roleProof, secondEscrowId);
        //     const secondEscrowContract = await ethers.getContractAt('Escrow', secondEscrowAddress);
        //     await secondEscrowContract.connect(admin).enableRefund(0);
        //
        //     await escrowManagerContract.connect(admin).updateFeeRecipient(other.address);
        //     expect(await firstEscrowContract.connect(payer1).getFeeRecipient()).to.equal(other.address);
        //     expect(await secondEscrowContract.connect(payer1).getFeeRecipient()).to.equal(feeRecipient.address);
        // });
        it('should not update fee recipient address if caller is not the admin', async () => {
            await expect(escrowManagerContract.connect(payer1).updateFeeRecipient(other.address)).to.be.revertedWith(
                'EscrowManager: caller is not the admin'
            );
        });
        it('should update base fee', async () => {
            const tx = await escrowManagerContract.updateBaseFee(30);
            expect(tx).to.emit(escrowManagerContract, 'BaseFeeUpdated').withArgs(30);
            expect(await escrowManagerContract.getBaseFee(roleProof)).to.equal(30);
        });
        it('should not update base fee if caller is not the admin', async () => {
            await expect(escrowManagerContract.connect(payer1).updateBaseFee(30)).to.be.revertedWith('EscrowManager: caller is not the admin');
        });
        it('should update percentage fee', async () => {
            const tx = await escrowManagerContract.updatePercentageFee(2);
            expect(tx).to.emit(escrowManagerContract, 'PercentageFeeUpdated').withArgs(2);
            expect(await escrowManagerContract.getPercentageFee(roleProof)).to.equal(2);
        });
        it('should not update percentage fee if caller is not the admin', async () => {
            await expect(escrowManagerContract.connect(payer1).updatePercentageFee(30)).to.be.revertedWith('EscrowManager: caller is not the admin');
        });
    });
    describe('Escrow creation', () => {
        it('should create an escrow', async () => {
            const tx = await escrowManagerContract.registerEscrow(roleProof, admin.address, payee.address, duration, tokenContract.address);

            const receipt = await tx.wait();
            const event = receipt.events.find((event: Event) => event.event === 'EscrowRegistered');
            const id = event.args.id.toNumber();

            expect(id).to.equal(1);
            expect(tx).to.emit(escrowManagerContract, 'EscrowRegistered').withArgs(id, payee, tokenContract.address, feeRecipient.address);

            const escrowCounter = await escrowManagerContract.getEscrowCounter(roleProof);
            expect(escrowCounter).to.equal(1);

            const escrowAddress = await escrowManagerContract.getEscrow(roleProof, id);
            expect(escrowAddress).to.not.equal(ethers.constants.AddressZero);
            const escrowContract = await ethers.getContractAt('Escrow', escrowAddress);

            expect(await escrowContract.getPayee()).to.equal(payee.address);
            expect(await escrowContract.getDuration()).to.equal(duration);
            expect(await escrowContract.getTokenAddress()).to.equal(tokenContract.address);
        });
        it('should fail escrow registration if payee is zero address', async () => {
            await expect(
                escrowManagerContract.registerEscrow(roleProof, admin.address, ethers.constants.AddressZero, duration, tokenContract.address)
            ).to.be.revertedWith('EscrowManager: payee is the zero address');
        });
        it('should fail escrow registration if duration is zero', async () => {
            await expect(escrowManagerContract.registerEscrow(roleProof, admin.address, payee.address, 0, tokenContract.address)).to.be.revertedWith(
                'EscrowManager: duration is zero'
            );
        });
        it('should fail escrow registration if token address is zero address', async () => {
            await expect(
                escrowManagerContract.registerEscrow(roleProof, admin.address, payee.address, duration, ethers.constants.AddressZero)
            ).to.be.revertedWith('EscrowManager: token address is the zero address');
        });
    });
    describe('Admins', () => {
        it('should add an admin and later remove it', async () => {
            await escrowManagerContract.connect(admin).addAdmin(other.address);
            await expect(escrowManagerContract.connect(other).addAdmin(feeRecipient.address)).to.not.be.reverted;

            await escrowManagerContract.connect(admin).removeAdmin(other.address);
            await expect(escrowManagerContract.connect(other).addAdmin(feeRecipient.address)).to.be.revertedWith(
                'EscrowManager: caller is not the admin'
            );
        });
    });
});
