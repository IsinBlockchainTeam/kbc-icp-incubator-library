/* eslint-disable @typescript-eslint/no-shadow, import/no-extraneous-dependencies */
import { Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ContractName } from '../constants/contracts';

describe('DownPaymentManager.sol', () => {
    let downPaymentManagerContract: Contract;
    let tokenContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress, payer1: SignerWithAddress, other: SignerWithAddress, feeRecipient: SignerWithAddress;
    const depositAmount: number = 120;
    const duration: number = 60 * 60 * 24 * 30; // 30 days
    const baseFee: number = 20;
    const percentageFee: number = 1;

    beforeEach(async () => {
        [admin, payee, payer1, other, feeRecipient] = await ethers.getSigners();

        const DownPaymentManager = await ethers.getContractFactory('DownPaymentManager');
        downPaymentManagerContract = await DownPaymentManager.deploy(admin.address, feeRecipient.address, baseFee, percentageFee);
        await downPaymentManagerContract.deployed();

        const Token = await ethers.getContractFactory('MyToken');
        tokenContract = await Token.deploy(depositAmount * 10);
        await tokenContract.deployed();
        await tokenContract.transfer(payer1.address, depositAmount * 2);
    });

    async function registerNewDownPayment(payee: SignerWithAddress, duration: number): Promise<number> {
        const tx = await downPaymentManagerContract.registerDownPayment(0, payee.address, duration, tokenContract.address);
        const receipt = await tx.wait();
        return receipt.events.find((event: Event) => event.event === 'DownPaymentRegistered').args.id.toNumber();
    }

    describe('DownPaymentManager creation', () => {
        it('should fail creating a down payment manager if admin is the zero address', async () => {
            const DownPaymentManager = await ethers.getContractFactory('DownPaymentManager');
            await expect(DownPaymentManager.deploy(ethers.constants.AddressZero, feeRecipient.address, baseFee, percentageFee)).to.be.revertedWith(
                'DownPaymentManager: admin is the zero address'
            );
        });
        it('should fail creating a down payment manager if fee recipient is the zero address', async () => {
            const DownPaymentManager = await ethers.getContractFactory('DownPaymentManager');
            await expect(DownPaymentManager.deploy(admin.address, ethers.constants.AddressZero, baseFee, percentageFee)).to.be.revertedWith(
                'DownPaymentManager: fee recipient is the zero address'
            );
        });
        it('should fail creating a down payment manager if commissioner is percentageFee is greater than 100', async () => {
            const DownPaymentManager = await ethers.getContractFactory('DownPaymentManager');
            await expect(DownPaymentManager.deploy(admin.address, feeRecipient.address, baseFee, 101)).to.be.revertedWith(
                'DownPaymentManager: percentage fee cannot be greater than 100'
            );
        });
    });
    describe('Update', () => {
        it('should update fee recipient address', async () => {
            const id = await registerNewDownPayment(payee, duration);

            const tx = await downPaymentManagerContract.updateFeeRecipient(other.address);
            expect(tx).to.emit(downPaymentManagerContract, 'FeeRecipientUpdated').withArgs(other.address);
            expect(await downPaymentManagerContract.getFeeRecipient()).to.equal(other.address);

            const downPaymentAddress = await downPaymentManagerContract.getDownPayment(id);
            const downPaymentContract = await ethers.getContractAt(ContractName.DOWN_PAYMENT, downPaymentAddress);
            expect(await downPaymentContract.getFeeRecipient()).to.equal(other.address);
        });
        // TODO: fix this test
        // it('should not update fee recipient address for downPayments with state not active', async () => {
        //     const firstDownPaymentId = await registerNewDownPayment(payee, duration);
        //     const secondDownPaymentId = await registerNewDownPayment(payee, duration);
        //
        //     // STATE: ACTIVE
        //     const firstDownPaymentAddress = await downPaymentManagerContract.getDownPayment(roleProof, firstDownPaymentId);
        //     const firstDownPaymentContract = await ethers.getContractAt(ContractName.DOWN_PAYMENT, firstDownPaymentAddress);
        //
        //     // STATE: REFUNDING
        //     const secondDownPaymentAddress = await downPaymentManagerContract.getDownPayment(roleProof, secondDownPaymentId);
        //     const secondDownPaymentContract = await ethers.getContractAt(ContractName.DOWN_PAYMENT, secondDownPaymentAddress);
        //     await secondDownPaymentContract.connect(admin).enableRefund(0);
        //
        //     await downPaymentManagerContract.connect(admin).updateFeeRecipient(other.address);
        //     expect(await firstDownPaymentContract.connect(payer1).getFeeRecipient()).to.equal(other.address);
        //     expect(await secondDownPaymentContract.connect(payer1).getFeeRecipient()).to.equal(feeRecipient.address);
        // });
        it('should not update fee recipient address if caller is not the admin', async () => {
            await expect(downPaymentManagerContract.connect(payer1).updateFeeRecipient(other.address)).to.be.revertedWith(
                'DownPaymentManager: caller is not the admin'
            );
        });
        it('should update base fee', async () => {
            const tx = await downPaymentManagerContract.updateBaseFee(30);
            expect(tx).to.emit(downPaymentManagerContract, 'BaseFeeUpdated').withArgs(30);
            expect(await downPaymentManagerContract.getBaseFee()).to.equal(30);
        });
        it('should not update base fee if caller is not the admin', async () => {
            await expect(downPaymentManagerContract.connect(payer1).updateBaseFee(30)).to.be.revertedWith(
                'DownPaymentManager: caller is not the admin'
            );
        });
        it('should update percentage fee', async () => {
            const tx = await downPaymentManagerContract.updatePercentageFee(2);
            expect(tx).to.emit(downPaymentManagerContract, 'PercentageFeeUpdated').withArgs(2);
            expect(await downPaymentManagerContract.getPercentageFee()).to.equal(2);
        });
        it('should not update percentage fee if caller is not the admin', async () => {
            await expect(downPaymentManagerContract.connect(payer1).updatePercentageFee(30)).to.be.revertedWith(
                'DownPaymentManager: caller is not the admin'
            );
        });
    });
    describe('Down payment by shipment', () => {
        it('should get downPaymen by shipment', async () => {
            expect(await downPaymentManagerContract.getDownPaymentByShipmentId(0)).to.equal(ethers.constants.AddressZero);
            await registerNewDownPayment(payee, duration);
            expect(await downPaymentManagerContract.getDownPaymentByShipmentId(0)).to.not.equal(ethers.constants.AddressZero);
        });
    });
    describe('Down payment creation', () => {
        it('should create a down payment', async () => {
            const tx = await downPaymentManagerContract.registerDownPayment(0, payee.address, duration, tokenContract.address);

            const receipt = await tx.wait();
            const event = receipt.events.find((event: Event) => event.event === 'DownPaymentRegistered');
            const id = event.args.id.toNumber();

            expect(id).to.equal(1);
            expect(tx).to.emit(downPaymentManagerContract, 'DownPaymentRegistered').withArgs(id, payee, tokenContract.address, feeRecipient.address);

            const downPaymentCounter = await downPaymentManagerContract.getDownPaymentCounter();
            expect(downPaymentCounter).to.equal(1);

            const downPaymentAddress = await downPaymentManagerContract.getDownPayment(id);
            expect(downPaymentAddress).to.not.equal(ethers.constants.AddressZero);
            const downPaymentContract = await ethers.getContractAt(ContractName.DOWN_PAYMENT, downPaymentAddress);

            expect(await downPaymentContract.getPayee()).to.equal(payee.address);
            expect(await downPaymentContract.getDuration()).to.equal(duration);
            expect(await downPaymentContract.getTokenAddress()).to.equal(tokenContract.address);
        });
        it('should fail downPayment registration if payee is zero address', async () => {
            await expect(
                downPaymentManagerContract.registerDownPayment(0, ethers.constants.AddressZero, duration, tokenContract.address)
            ).to.be.revertedWith('DownPaymentManager: payee is the zero address');
        });
        it('should fail downPayment registration if duration is zero', async () => {
            await expect(downPaymentManagerContract.registerDownPayment(0, payee.address, 0, tokenContract.address)).to.be.revertedWith(
                'DownPaymentManager: duration is zero'
            );
        });
        it('should fail downPayment registration if token address is zero address', async () => {
            await expect(downPaymentManagerContract.registerDownPayment(0, payee.address, duration, ethers.constants.AddressZero)).to.be.revertedWith(
                'DownPaymentManager: token address is the zero address'
            );
        });
    });
    describe('Admins', () => {
        it('should add an admin and later remove it', async () => {
            await downPaymentManagerContract.connect(admin).addAdmin(other.address);
            await expect(downPaymentManagerContract.connect(other).addAdmin(feeRecipient.address)).to.not.be.reverted;

            await downPaymentManagerContract.connect(admin).removeAdmin(other.address);
            await expect(downPaymentManagerContract.connect(other).addAdmin(feeRecipient.address)).to.be.revertedWith(
                'DownPaymentManager: caller is not the admin'
            );
        });
    });
});
