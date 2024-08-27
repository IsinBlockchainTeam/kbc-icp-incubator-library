// TODO: understand if this tests need further fixing
// /* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
//
// import { ethers } from 'hardhat';
// import { Contract, ContractFactory } from 'ethers';
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import { expect } from 'chai';
// import { ContractName } from '../utils/constants';
//
// describe('Escrow.sol', () => {
//     let escrowContract: Contract;
//     let tokenContract: Contract;
//     let admin: SignerWithAddress,
//         payee: SignerWithAddress,
//         payer1: SignerWithAddress,
//         payer2: SignerWithAddress,
//         feeRecipient: SignerWithAddress,
//         anotherFeeRecipient: SignerWithAddress;
//     const duration = 60 * 60 * 24 * 30; // 30 days
//     const depositAmount: number = 120;
//     const baseFee: number = 20;
//     const percentageFee: number = 1;
//     let EscrowContract: ContractFactory;
//
//     const calculateFee = (amount: number) => baseFee + Math.floor(((amount - baseFee) * percentageFee) / 100);
//     const deposit = async (actor: SignerWithAddress, amount: number) => {
//         await tokenContract.connect(actor).approve(escrowContract.address, amount);
//         return escrowContract.connect(actor).deposit(amount);
//     };
//
//     beforeEach(async () => {
//         [admin, payee, payer1, payer2, feeRecipient, anotherFeeRecipient] = await ethers.getSigners();
//
//         const Token = await ethers.getContractFactory(ContractName.MY_TOKEN);
//         tokenContract = await Token.deploy(depositAmount * 10);
//         await tokenContract.deployed();
//         await tokenContract.transfer(payer1.address, depositAmount * 2);
//         await tokenContract.transfer(payer2.address, depositAmount * 2);
//
//         EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//         escrowContract = await EscrowContract.deploy(
//             admin.address,
//             payee.address,
//             duration,
//             tokenContract.address,
//             feeRecipient.address,
//             baseFee,
//             percentageFee
//         );
//         await escrowContract.deployed();
//     });
//     describe('Escrow creation', () => {
//         it('should retrieve escrow correctly', async () => {
//             expect(await escrowContract.getOwner()).to.equal(payee.address);
//             expect(await escrowContract.getPayee()).to.equal(payee.address);
//             expect(await escrowContract.getDeployedAt()).to.be.closeTo(Math.floor(Date.now() / 1000), 100);
//             expect(await escrowContract.getDuration()).to.equal(duration);
//             expect(await escrowContract.getTokenAddress()).to.equal(tokenContract.address);
//             expect(await escrowContract.getToken()).to.equal(tokenContract.address);
//             expect(await escrowContract.getState()).to.equal(0);
//             expect(await escrowContract.getFeeRecipient()).to.equal(feeRecipient.address);
//             expect(await escrowContract.getBaseFee()).to.equal(baseFee);
//             expect(await escrowContract.getPercentageFee()).to.equal(percentageFee);
//             expect(await escrowContract.getDepositedAmount()).to.equal(0);
//             expect(await escrowContract.getTotalDepositedAmount()).to.equal(0);
//             expect(await escrowContract.getRefundedAmount()).to.equal(0);
//             expect(await escrowContract.getTotalRefundedAmount()).to.equal(0);
//             expect(await escrowContract.getTotalWithdrawnAmount()).to.equal(0);
//         });
//         it('should fail creating an escrow if admin is the zero address', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(
//                     ethers.constants.AddressZero,
//                     payee.address,
//                     duration,
//                     tokenContract.address,
//                     feeRecipient.address,
//                     baseFee,
//                     percentageFee
//                 )
//             ).to.be.revertedWith('Escrow: admin is the zero address');
//         });
//         it('should fail creating an escrow if payee is the zero address', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(
//                     admin.address,
//                     ethers.constants.AddressZero,
//                     duration,
//                     tokenContract.address,
//                     feeRecipient.address,
//                     baseFee,
//                     percentageFee
//                 )
//             ).to.be.revertedWith('Escrow: payee is the zero address');
//         });
//         it('should fail creating an escrow if duration is zero', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(admin.address, payee.address, 0, tokenContract.address, feeRecipient.address, baseFee, percentageFee)
//             ).to.be.revertedWith('Escrow: duration is zero');
//         });
//         it('should fail creating an escrow if token address is the zero address', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(
//                     admin.address,
//                     payee.address,
//                     duration,
//                     ethers.constants.AddressZero,
//                     feeRecipient.address,
//                     baseFee,
//                     percentageFee
//                 )
//             ).to.be.revertedWith('Escrow: token address is the zero address');
//         });
//         it('should fail creating an escrow if fee recipient is the zero address', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(
//                     admin.address,
//                     payee.address,
//                     duration,
//                     tokenContract.address,
//                     ethers.constants.AddressZero,
//                     baseFee,
//                     percentageFee
//                 )
//             ).to.be.revertedWith('Escrow: fee recipient is the zero address');
//         });
//         it('should fail creating an escrow if percentage fee is greater than 100', async () => {
//             EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
//             await expect(
//                 EscrowContract.deploy(admin.address, payee.address, duration, tokenContract.address, feeRecipient.address, baseFee, 101)
//             ).to.be.revertedWith('Escrow: percentage fee cannot be greater than 100');
//         });
//     });
//     describe('Deposit', () => {
//         it('should be able to deposit in Active state', async () => {
//             const initialBalance = Number(await tokenContract.balanceOf(payer1.address));
//             const tx = await deposit(payer1, depositAmount);
//             await expect(tx).to.emit(escrowContract, 'EscrowDeposited');
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//             expect(await escrowContract.getTotalDepositedAmount()).to.equal(depositAmount);
//             expect(await tokenContract.balanceOf(payer1.address)).to.equal(initialBalance - depositAmount);
//         });
//         it('should not be able to deposit in other state', async () => {
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             expect(await escrowContract.getState()).to.equal(1);
//             await expect(deposit(payer1, depositAmount)).to.be.revertedWith('Escrow: can only deposit while active');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             expect(await escrowContract.getState()).to.equal(2);
//             await expect(deposit(payer1, depositAmount)).to.be.revertedWith('Escrow: can only deposit while active');
//         });
//         it('should not be able to deposit zero tokens', async () => {
//             await expect(deposit(payer1, 0)).to.be.revertedWith('Escrow: can only deposit positive amount');
//         });
//     });
//     describe('Payer Withdraw', () => {
//         it('should be able to freely withdraw in Active state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             const initialBalance = Number(await tokenContract.balanceOf(payer1.address));
//             const tx = await escrowContract.connect(payer1).payerWithdraw(depositAmount - 10);
//             await expect(tx).to.emit(escrowContract, 'EscrowWithdrawn');
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(10);
//             expect(await escrowContract.getTotalDepositedAmount()).to.equal(10);
//             expect(await escrowContract.getTotalWithdrawnAmount()).to.equal(0);
//             expect(await tokenContract.balanceOf(payer1.address)).to.equal(initialBalance + depositAmount - 10);
//         });
//         it('should not be able to freely withdraw in other state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             expect(await escrowContract.getState()).to.equal(1);
//             await expect(escrowContract.connect(payer1).payerWithdraw(depositAmount)).to.be.revertedWith('Escrow: can only withdraw while active');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             expect(await escrowContract.getState()).to.equal(2);
//             await expect(escrowContract.connect(payer1).payerWithdraw(depositAmount)).to.be.revertedWith('Escrow: can only withdraw while active');
//         });
//         it('should not be able to withdraw zero tokens', async () => {
//             await expect(escrowContract.connect(payer1).payerWithdraw(0)).to.be.revertedWith('Escrow: can only withdraw positive amount');
//         });
//         it('should not be able to withdraw more tokens then I deposited', async () => {
//             await deposit(payer1, depositAmount);
//             await expect(escrowContract.connect(payer1).payerWithdraw(depositAmount + 10)).to.be.revertedWith(
//                 'Escrow: can only withdraw up to the deposited amount'
//             );
//         });
//     });
//     describe('Payee Withdraw', () => {
//         it('should be able to withdraw in Withdrawing state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             await escrowContract.connect(admin).enableWithdrawal(100);
//             expect(await escrowContract.getState()).to.equal(1);
//
//             const payeeInitialBalance = Number(await tokenContract.balanceOf(payee.address));
//             const feeRecipientInitialBalance = Number(await tokenContract.balanceOf(feeRecipient.address));
//             const tx = await escrowContract.payeeWithdraw();
//             await expect(tx).to.emit(escrowContract, 'EscrowWithdrawn');
//             expect(await escrowContract.getTotalWithdrawnAmount()).to.equal(depositAmount);
//
//             const fees = calculateFee(depositAmount);
//             expect(await tokenContract.balanceOf(payee.address)).to.equal(payeeInitialBalance + depositAmount - fees);
//             expect(await tokenContract.balanceOf(feeRecipient.address)).to.equal(feeRecipientInitialBalance + fees);
//         });
//         it('should not be able to withdraw in other state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             await expect(escrowContract.payeeWithdraw()).to.be.revertedWith('Escrow: can only withdraw while withdrawing');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             expect(await escrowContract.getState()).to.equal(2);
//             await expect(escrowContract.payeeWithdraw()).to.be.revertedWith('Escrow: can only withdraw while withdrawing');
//         });
//         it('should not be able to withdraw zero tokens', async () => {
//             await escrowContract.connect(admin).enableWithdrawal(100);
//             expect(await escrowContract.getState()).to.equal(1);
//
//             await expect(escrowContract.payeeWithdraw()).to.be.revertedWith('Escrow: can only withdraw when there is something to withdraw');
//         });
//     });
//     describe('Payer Refund', () => {
//         it('should be able to refund in Refunding state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             await escrowContract.connect(admin).enableRefund(100);
//             expect(await escrowContract.getState()).to.equal(2);
//
//             const payerInitialBalance = Number(await tokenContract.balanceOf(payer1.address));
//             const feeRecipientInitialBalance = Number(await tokenContract.balanceOf(feeRecipient.address));
//             const tx = await escrowContract.connect(payer1).payerRefund();
//             await expect(tx).to.emit(escrowContract, 'EscrowRefunded');
//             expect(await escrowContract.connect(payer1).getRefundedAmount()).to.equal(depositAmount);
//             expect(await escrowContract.getTotalRefundedAmount()).to.equal(depositAmount);
//
//             const fees = calculateFee(depositAmount);
//             expect(await tokenContract.balanceOf(payer1.address)).to.equal(payerInitialBalance + depositAmount - fees);
//             expect(await tokenContract.balanceOf(feeRecipient.address)).to.equal(feeRecipientInitialBalance + fees);
//         });
//         it('should not be able to refund in other state', async () => {
//             await deposit(payer1, depositAmount);
//             expect(await escrowContract.connect(payer1).getDepositedAmount()).to.equal(depositAmount);
//
//             await expect(escrowContract.connect(payer1).payerRefund()).to.be.revertedWith('Escrow: can only refund while refunding');
//
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             expect(await escrowContract.getState()).to.equal(1);
//             await expect(escrowContract.connect(payer1).payerRefund()).to.be.revertedWith('Escrow: can only refund while refunding');
//         });
//         it('should not be able to withdraw zero tokens', async () => {
//             await escrowContract.connect(admin).enableRefund(100);
//             expect(await escrowContract.getState()).to.equal(2);
//
//             await expect(escrowContract.connect(payer1).payerRefund()).to.be.revertedWith(
//                 'Escrow: can only refund when there is something to refund'
//             );
//         });
//     });
//     describe('Update Fee Recipient', () => {
//         it('should update fee recipient', async () => {
//             await deposit(payer1, depositAmount);
//             await escrowContract.connect(admin).updateFeeRecipient(anotherFeeRecipient.address);
//             await escrowContract.connect(admin).enableRefund(100);
//
//             const feeRecipientInitialBalance = Number(await tokenContract.balanceOf(feeRecipient.address));
//             const anotherFeeRecipientInitialBalance = Number(await tokenContract.balanceOf(anotherFeeRecipient.address));
//             await escrowContract.connect(payer1).payerRefund();
//             const fees = calculateFee(depositAmount);
//
//             expect(await tokenContract.balanceOf(feeRecipient.address)).to.equal(feeRecipientInitialBalance);
//             expect(await tokenContract.balanceOf(anotherFeeRecipient.address)).to.equal(anotherFeeRecipientInitialBalance + fees);
//         });
//         it('should fail updating fee recipient address if in wrong state', async () => {
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             await expect(escrowContract.connect(admin).updateFeeRecipient(payer1.address)).to.be.revertedWith('Escrow: can only edit while active');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             await expect(escrowContract.connect(admin).updateFeeRecipient(payer1.address)).to.be.revertedWith('Escrow: can only edit while active');
//         });
//         it('should fail updating fee recipient address if caller is not admin', async () => {
//             await expect(escrowContract.connect(payer1).updateFeeRecipient(payer1.address)).to.be.revertedWith('Escrow: caller is not the admin');
//         });
//         it('should fail updating fee recipient address if the new recipient is the zero address', async () => {
//             await expect(escrowContract.connect(admin).updateFeeRecipient(ethers.constants.AddressZero)).to.be.revertedWith(
//                 'Escrow: fee recipient is the zero address'
//             );
//         });
//         it('should fail updating fee recipient address if the new recipient is the same to the current one', async () => {
//             await expect(escrowContract.connect(admin).updateFeeRecipient(feeRecipient.address)).to.be.revertedWith(
//                 'Escrow: new fee recipient is the same of the current one'
//             );
//         });
//     });
//     describe('Update Base Fee', () => {
//         it('should update the base fee', async () => {
//             await escrowContract.connect(admin).updateBaseFee(50);
//             expect(await escrowContract.getBaseFee()).to.equal(50);
//         });
//         it('should fail updating base fee if in wrong state', async () => {
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             await expect(escrowContract.connect(admin).updateBaseFee(0)).to.be.revertedWith('Escrow: can only edit while active');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             await expect(escrowContract.connect(admin).updateBaseFee(0)).to.be.revertedWith('Escrow: can only edit while active');
//         });
//         it('should fail updating base fee if caller is not admin', async () => {
//             await expect(escrowContract.connect(payer1).updateBaseFee(0)).to.be.revertedWith('Escrow: caller is not the admin');
//         });
//     });
//     describe('Update Percentage Fee', () => {
//         it('should update the percentage fee', async () => {
//             await escrowContract.connect(admin).updatePercentageFee(5);
//             expect(await escrowContract.getPercentageFee()).to.equal(5);
//         });
//         it('should fail updating percentage fee if in wrong state', async () => {
//             await escrowContract.connect(admin).enableWithdrawal(0);
//             await expect(escrowContract.connect(admin).updatePercentageFee(0)).to.be.revertedWith('Escrow: can only edit while active');
//
//             await escrowContract.connect(admin).enableRefund(0);
//             await expect(escrowContract.connect(admin).updatePercentageFee(0)).to.be.revertedWith('Escrow: can only edit while active');
//         });
//         it('should fail updating percentage fee if caller is not admin', async () => {
//             await expect(escrowContract.connect(payer1).updatePercentageFee(0)).to.be.revertedWith('Escrow: caller is not the admin');
//         });
//     });
//     describe('Admins', () => {
//         it('should add an admin and later remove it', async () => {
//             await escrowContract.connect(admin).addAdmin(feeRecipient.address);
//             await expect(escrowContract.connect(feeRecipient).addAdmin(anotherFeeRecipient.address)).to.not.be.reverted;
//
//             await escrowContract.connect(admin).removeAdmin(feeRecipient.address);
//             await expect(escrowContract.connect(feeRecipient).addAdmin(feeRecipient.address)).to.be.revertedWith('Escrow: caller is not the admin');
//         });
//     });
// });
