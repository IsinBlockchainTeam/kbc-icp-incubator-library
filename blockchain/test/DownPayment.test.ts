/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ContractName } from '../constants/contracts';

describe('DownPayment.sol', () => {
    let downPaymentContract: Contract;
    let tokenContract: Contract;
    let admin: SignerWithAddress,
        payee: SignerWithAddress,
        payer1: SignerWithAddress,
        payer2: SignerWithAddress,
        feeRecipient: SignerWithAddress,
        anotherFeeRecipient: SignerWithAddress;
    const duration = 60 * 60 * 24 * 30; // 30 days
    const depositAmount: number = 120;
    const baseFee: number = 20;
    const percentageFee: number = 1;
    let DownPaymentContract: ContractFactory;

    const calculateFee = (amount: number) => baseFee + Math.floor(((amount - baseFee) * percentageFee) / 100);
    const deposit = async (actor: SignerWithAddress, amount: number) => {
        await tokenContract.connect(actor).approve(downPaymentContract.address, amount);
        return downPaymentContract.connect(actor).deposit(amount, actor.address);
    };
    const withdraw = async (actor: SignerWithAddress, amount: number) => downPaymentContract.connect(actor).withdraw(amount);
    const lockFunds = async (actor: SignerWithAddress, amount: number) => downPaymentContract.connect(actor).lockFunds(amount);
    const releaseFunds = async (actor: SignerWithAddress, amount: number) => downPaymentContract.connect(actor).releaseFunds(amount);
    const refundFunds = async (actor: SignerWithAddress, amount: number) => downPaymentContract.connect(actor).refundFunds(amount);

    beforeEach(async () => {
        [admin, payee, payer1, payer2, feeRecipient, anotherFeeRecipient] = await ethers.getSigners();

        const Token = await ethers.getContractFactory(ContractName.MY_TOKEN);
        tokenContract = await Token.deploy(depositAmount * 10);
        await tokenContract.deployed();
        await tokenContract.transfer(payer1.address, depositAmount * 2);
        await tokenContract.transfer(payer2.address, depositAmount * 2);

        DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
        downPaymentContract = await DownPaymentContract.deploy(
            admin.address,
            payee.address,
            duration,
            tokenContract.address,
            feeRecipient.address,
            baseFee,
            percentageFee
        );
        await downPaymentContract.deployed();
    });
    describe('Down payment creation', () => {
        it('should retrieve down payment correctly', async () => {
            expect(await downPaymentContract.getOwner()).to.equal(payee.address);
            expect(await downPaymentContract.getPayee()).to.equal(payee.address);
            expect(await downPaymentContract.getPayers()).to.deep.equal([]);
            expect(await downPaymentContract.getDuration()).to.equal(duration);
            expect(await downPaymentContract.getTokenAddress()).to.equal(tokenContract.address);
            expect(await downPaymentContract.getToken()).to.equal(tokenContract.address);
            expect(await downPaymentContract.getFeeRecipient()).to.equal(feeRecipient.address);
            expect(await downPaymentContract.getBaseFee()).to.equal(baseFee);
            expect(await downPaymentContract.getPercentageFee()).to.equal(percentageFee);
            expect(await downPaymentContract.getFees(depositAmount)).to.equal(calculateFee(depositAmount));
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(0);
            expect(await downPaymentContract.getDepositedAmount(payee.address)).to.equal(0);
            expect(await downPaymentContract.getLockedAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getRefundedAmount(payee.address)).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(0);
            expect(await downPaymentContract.getBalance()).to.equal(0);
            expect(await downPaymentContract.getWithdrawableAmount(payee.address)).to.equal(0);
            expect(await downPaymentContract.getRefundableAmount(100, payee.address)).to.equal(0);
        });
        it('should fail creating a down payment if admin is the zero address', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(
                    ethers.constants.AddressZero,
                    payee.address,
                    duration,
                    tokenContract.address,
                    feeRecipient.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('DownPayment: admin is the zero address');
        });
        it('should fail creating a down payment if payee is the zero address', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(
                    admin.address,
                    ethers.constants.AddressZero,
                    duration,
                    tokenContract.address,
                    feeRecipient.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('DownPayment: payee is the zero address');
        });
        it('should fail creating a down payment if duration is zero', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(admin.address, payee.address, 0, tokenContract.address, feeRecipient.address, baseFee, percentageFee)
            ).to.be.revertedWith('DownPayment: duration is zero');
        });
        it('should fail creating a down payment if token address is the zero address', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(
                    admin.address,
                    payee.address,
                    duration,
                    ethers.constants.AddressZero,
                    feeRecipient.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('DownPayment: token address is the zero address');
        });
        it('should fail creating a down payment if fee recipient is the zero address', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(
                    admin.address,
                    payee.address,
                    duration,
                    tokenContract.address,
                    ethers.constants.AddressZero,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('DownPayment: fee recipient is the zero address');
        });
        it('should fail creating a down payment if percentage fee is greater than 100', async () => {
            DownPaymentContract = await ethers.getContractFactory(ContractName.DOWN_PAYMENT);
            await expect(
                DownPaymentContract.deploy(admin.address, payee.address, duration, tokenContract.address, feeRecipient.address, baseFee, 101)
            ).to.be.revertedWith('DownPayment: percentage fee cannot be greater than 100');
        });
    });
    describe('Deposit', () => {
        it('should be able to deposit funds if admin', async () => {
            const initialBalance = Number(await tokenContract.balanceOf(admin.address));
            const tx = await deposit(admin, depositAmount);
            await expect(tx).to.emit(downPaymentContract, 'DownPaymentDeposited');
            expect(await downPaymentContract.getPayers()).to.deep.equal([admin.address]);
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getDepositedAmount(admin.address)).to.equal(depositAmount);
            expect(await downPaymentContract.getLockedAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(0);
            expect(await downPaymentContract.getBalance()).to.equal(depositAmount);
            expect(await downPaymentContract.getWithdrawableAmount(admin.address)).to.equal(depositAmount);
            expect(await downPaymentContract.getRefundableAmount(100, admin.address)).to.equal(100);
            expect(await tokenContract.balanceOf(admin.address)).to.equal(initialBalance - depositAmount);
        });
        it('should not be able to deposit if not admin', async () => {
            await expect(deposit(payer1, depositAmount)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
        it('should not be able to deposit zero tokens', async () => {
            await expect(deposit(admin, 0)).to.be.revertedWith('DownPayment: can only deposit positive amount');
        });
    });
    describe('Withdraw', () => {
        it('should be able to withdraw funds ', async () => {
            const initialBalance = Number(await tokenContract.balanceOf(admin.address));
            await deposit(admin, depositAmount);
            const tx = await withdraw(admin, depositAmount);
            await expect(tx).to.emit(downPaymentContract, 'DownPaymentWithdrawn');
            expect(await downPaymentContract.getPayers()).to.deep.equal([]);
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(0);
            expect(await downPaymentContract.getDepositedAmount(admin.address)).to.equal(0);
            expect(await downPaymentContract.getLockedAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(0);
            expect(await downPaymentContract.getBalance()).to.equal(0);
            expect(await downPaymentContract.getWithdrawableAmount(admin.address)).to.equal(0);
            expect(await downPaymentContract.getRefundableAmount(100, admin.address)).to.equal(0);
            expect(await tokenContract.balanceOf(admin.address)).to.equal(initialBalance);
        });
        it('should not be able to withdraw zero tokens', async () => {
            await expect(withdraw(admin, 0)).to.be.revertedWith('DownPayment: can only withdraw positive amount');
        });
        it('should not be able to withdraw more tokens than the withdrawable one', async () => {
            await deposit(admin, depositAmount);
            await expect(withdraw(admin, depositAmount + 10)).to.be.revertedWith('DownPayment: can only withdraw up to the withdrawable amount');
        });
    });
    describe('Lock funds', () => {
        it('should be able to lock funds if admin', async () => {
            const initialBalance = Number(await tokenContract.balanceOf(admin.address));
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getDepositedAmount(admin.address)).to.equal(depositAmount);
            expect(await downPaymentContract.getLockedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(0);
            expect(await downPaymentContract.getBalance()).to.equal(depositAmount);
            expect(await downPaymentContract.getWithdrawableAmount(admin.address)).to.equal(0);
            expect(await downPaymentContract.getRefundableAmount(100, admin.address)).to.equal(100);
            expect(await tokenContract.balanceOf(admin.address)).to.equal(initialBalance - depositAmount);
        });
        it('should not be able to lock funds if not admin', async () => {
            await expect(lockFunds(payee, depositAmount)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
        it('should not be able to lock zero tokens', async () => {
            await expect(lockFunds(admin, 0)).to.be.revertedWith('DownPayment: can only lock positive amount');
        });
        it('should not be able to lock more tokens then the amount deposited', async () => {
            await deposit(admin, depositAmount);
            await expect(lockFunds(admin, depositAmount + 10)).to.be.revertedWith('DownPayment: can only lock up to the balance');
        });
    });
    describe('Release funds', () => {
        it('should be able to release funds if admin', async () => {
            const initialBalancePayee = Number(await tokenContract.balanceOf(payee.address));
            const initialBalancePayer = Number(await tokenContract.balanceOf(admin.address));
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await releaseFunds(admin, depositAmount);
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getDepositedAmount(admin.address)).to.equal(depositAmount);
            expect(await downPaymentContract.getLockedAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(0);
            expect(await downPaymentContract.getBalance()).to.equal(0);
            expect(await downPaymentContract.getWithdrawableAmount(admin.address)).to.equal(0);
            expect(await downPaymentContract.getRefundableAmount(100, admin.address)).to.equal(100);
            expect(await tokenContract.balanceOf(payee.address)).to.equal(initialBalancePayee + depositAmount - calculateFee(depositAmount));
            expect(await tokenContract.balanceOf(admin.address)).to.equal(initialBalancePayer - depositAmount);
        });
        it('should not be able to release funds if not admin', async () => {
            await expect(releaseFunds(payee, depositAmount)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
        it('should not be able to release zero tokens', async () => {
            await expect(releaseFunds(admin, 0)).to.be.revertedWith('DownPayment: can only release positive amount');
        });
        it('should not be able to release more tokens than the amount locked', async () => {
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await expect(releaseFunds(admin, depositAmount + 10)).to.be.revertedWith('DownPayment: can only release up to the locked amount');
        });
    });
    describe('Payer Refund', () => {
        it('should be able to refund funds if admin', async () => {
            const initialBalancePayee = Number(await tokenContract.balanceOf(payee.address));
            const initialBalancePayer = Number(await tokenContract.balanceOf(admin.address));
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await refundFunds(admin, depositAmount);
            expect(await downPaymentContract.getTotalDepositedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getDepositedAmount(admin.address)).to.equal(depositAmount);
            expect(await downPaymentContract.getLockedAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasableAmount()).to.equal(0);
            expect(await downPaymentContract.getReleasedAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundableAmount()).to.equal(0);
            expect(await downPaymentContract.getTotalRefundedAmount()).to.equal(depositAmount);
            expect(await downPaymentContract.getBalance()).to.equal(0);
            expect(await downPaymentContract.getWithdrawableAmount(admin.address)).to.equal(0);
            expect(await downPaymentContract.getRefundableAmount(100, admin.address)).to.equal(100);
            expect(await tokenContract.balanceOf(payee.address)).to.equal(initialBalancePayee);
            expect(await tokenContract.balanceOf(admin.address)).to.equal(initialBalancePayer - calculateFee(depositAmount));
        });
        it('should not be able to refund funds if not admin', async () => {
            await expect(refundFunds(payee, depositAmount)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
        it('should not be able to refund zero tokens', async () => {
            await expect(refundFunds(admin, 0)).to.be.revertedWith('DownPayment: can only refund positive amount');
        });
        it('should not be able to refund more tokens than the amount locked', async () => {
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await expect(refundFunds(admin, depositAmount + 10)).to.be.revertedWith('DownPayment: can only refund up to the locked amount');
        });
    });
    describe('Update Fee Recipient', () => {
        it('should update fee recipient', async () => {
            await downPaymentContract.connect(admin).updateFeeRecipient(anotherFeeRecipient.address);
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);

            const feeRecipientInitialBalance = Number(await tokenContract.balanceOf(feeRecipient.address));
            const anotherFeeRecipientInitialBalance = Number(await tokenContract.balanceOf(anotherFeeRecipient.address));
            await refundFunds(admin, depositAmount);
            const fees = calculateFee(depositAmount);

            expect(await tokenContract.balanceOf(feeRecipient.address)).to.equal(feeRecipientInitialBalance);
            expect(await tokenContract.balanceOf(anotherFeeRecipient.address)).to.equal(anotherFeeRecipientInitialBalance + fees);
        });
        it('should fail updating fee recipient address if in wrong state', async () => {
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await expect(downPaymentContract.connect(admin).updateFeeRecipient(payer1.address)).to.be.revertedWith(
                'DownPayment: can only edit while no funds are locked'
            );
        });
        it('should fail updating fee recipient address if caller is not admin', async () => {
            await expect(downPaymentContract.connect(payer1).updateFeeRecipient(payer1.address)).to.be.revertedWith(
                'DownPayment: caller is not the admin'
            );
        });
        it('should fail updating fee recipient address if the new recipient is the zero address', async () => {
            await expect(downPaymentContract.connect(admin).updateFeeRecipient(ethers.constants.AddressZero)).to.be.revertedWith(
                'DownPayment: fee recipient is the zero address'
            );
        });
        it('should fail updating fee recipient address if the new recipient is the same to the current one', async () => {
            await expect(downPaymentContract.connect(admin).updateFeeRecipient(feeRecipient.address)).to.be.revertedWith(
                'DownPayment: new fee recipient is the same of the current one'
            );
        });
    });
    describe('Update Base Fee', () => {
        it('should update the base fee', async () => {
            await downPaymentContract.connect(admin).updateBaseFee(50);
            expect(await downPaymentContract.getBaseFee()).to.equal(50);
        });
        it('should fail updating base fee if in wrong state', async () => {
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await expect(downPaymentContract.connect(admin).updateBaseFee(0)).to.be.revertedWith(
                'DownPayment: can only edit while no funds are locked'
            );
        });
        it('should fail updating base fee if caller is not admin', async () => {
            await expect(downPaymentContract.connect(payer1).updateBaseFee(0)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
    });
    describe('Update Percentage Fee', () => {
        it('should update the percentage fee', async () => {
            await downPaymentContract.connect(admin).updatePercentageFee(5);
            expect(await downPaymentContract.getPercentageFee()).to.equal(5);
        });
        it('should fail updating percentage fee if in wrong state', async () => {
            await deposit(admin, depositAmount);
            await lockFunds(admin, depositAmount);
            await expect(downPaymentContract.connect(admin).updatePercentageFee(0)).to.be.revertedWith(
                'DownPayment: can only edit while no funds are locked'
            );
        });
        it('should fail updating percentage fee if caller is not admin', async () => {
            await expect(downPaymentContract.connect(payer1).updatePercentageFee(0)).to.be.revertedWith('DownPayment: caller is not the admin');
        });
    });
    describe('Admins', () => {
        it('should add an admin and later remove it', async () => {
            await downPaymentContract.connect(admin).addAdmin(feeRecipient.address);
            await expect(downPaymentContract.connect(feeRecipient).addAdmin(anotherFeeRecipient.address)).to.not.be.reverted;

            await downPaymentContract.connect(admin).removeAdmin(feeRecipient.address);
            await expect(downPaymentContract.connect(feeRecipient).addAdmin(feeRecipient.address)).to.be.revertedWith(
                'DownPayment: caller is not the admin'
            );
        });
    });
});
