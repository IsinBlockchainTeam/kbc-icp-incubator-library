/* eslint-disable no-unused-expressions */

import { ethers } from 'hardhat';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Escrow } from '../typechain-types';
import { ContractName } from '../utils/constants';

describe('Escrow.sol', () => {
    let escrowContract: Contract;
    let tokenContract: Contract;
    let admin: SignerWithAddress,
        payee: SignerWithAddress,
        purchaser: SignerWithAddress,
        delegate: SignerWithAddress,
        commissioner: SignerWithAddress,
        anotherCommissioner: SignerWithAddress;
    const duration = 60 * 60 * 24 * 30; // 30 days
    const agreedAmount: number = 1000;
    const depositAmount: number = 120;
    const baseFee: number = 20;
    const percentageFee: number = 1;
    let EscrowContract: ContractFactory;

    const mineBlocks = async (n: number) => {
        await ethers.provider.send('hardhat_mine', [`0x${n.toString(16)}`]);
    };
    const skipToDeadline = async () => {
        const proposalDeadline = await escrowContract.getDeadline();
        await mineBlocks(Number(proposalDeadline));
    };

    const calculateFee = (amount: number) =>
        baseFee + Math.floor(((amount - baseFee) * percentageFee) / 100);

    beforeEach(async () => {
        [admin, payee, purchaser, delegate, commissioner, anotherCommissioner] =
            await ethers.getSigners();

        const Token = await ethers.getContractFactory(ContractName.MY_TOKEN);
        tokenContract = await Token.deploy(depositAmount * 10);
        await tokenContract.deployed();
        await tokenContract.transfer(purchaser.address, depositAmount * 2);
        await tokenContract.transfer(delegate.address, depositAmount * 2);

        EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
        escrowContract = await EscrowContract.deploy(
            admin.address,
            payee.address,
            purchaser.address,
            agreedAmount,
            duration,
            tokenContract.address,
            commissioner.address,
            baseFee,
            percentageFee
        );
        await escrowContract.deployed();
    });

    describe('Escrow', () => {
        it('should retrieve escrow correctly', async () => {
            expect(await escrowContract.getOwner()).to.equal(payee.address);
            expect(await escrowContract.getPayee()).to.equal(payee.address);
            expect(await escrowContract.getPurchaser()).to.equal(purchaser.address);

            const payers = await escrowContract.getPayers();
            expect(payers).to.have.length(1);
            expect(payers[0]).to.equal(purchaser.address);

            const payer: Escrow.PayerStructOutput = await escrowContract.getPayer(payers[0]);
            expect(payer.depositedAmount).to.equal(BigNumber.from(0));
            expect(payer.isPresent).to.be.true;

            expect(await escrowContract.getAgreedAmount()).to.equal(agreedAmount);
            expect(await escrowContract.getAgreedAmount()).to.equal(agreedAmount);
            expect(await escrowContract.getDeployedAt()).to.be.closeTo(
                Math.floor(Date.now() / 1000),
                100
            );
            expect(await escrowContract.getDuration()).to.equal(duration);
            expect(await escrowContract.getState()).to.equal(0);
            expect(await escrowContract.getDepositAmount()).to.equal(0);
            expect(await escrowContract.getTokenAddress()).to.equal(tokenContract.address);
            expect(await escrowContract.getCommissioner()).to.equal(commissioner.address);
        });

        it('should fail creating an escrow if payee is the zero address', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            await expect(
                EscrowContract.deploy(
                    admin.address,
                    ethers.constants.AddressZero,
                    purchaser.address,
                    agreedAmount,
                    duration,
                    tokenContract.address,
                    commissioner.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('Escrow: payee is the zero address');
        });

        it('should fail creating an escrow if purchaser is the zero address', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            await expect(
                EscrowContract.deploy(
                    admin.address,
                    payee.address,
                    ethers.constants.AddressZero,
                    agreedAmount,
                    duration,
                    tokenContract.address,
                    commissioner.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('Escrow: purchaser is the zero address');
        });

        it('should fail creating an escrow if token address is the zero address', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            await expect(
                EscrowContract.deploy(
                    admin.address,
                    payee.address,
                    purchaser.address,
                    agreedAmount,
                    duration,
                    ethers.constants.AddressZero,
                    commissioner.address,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('Escrow: token address is the zero address');
        });

        it('should fail creating an escrow if commissioner is the zero address', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            await expect(
                EscrowContract.deploy(
                    admin.address,
                    payee.address,
                    purchaser.address,
                    agreedAmount,
                    duration,
                    tokenContract.address,
                    ethers.constants.AddressZero,
                    baseFee,
                    percentageFee
                )
            ).to.be.revertedWith('Escrow: commissioner is the zero address');
        });

        it('should fail creating an escrow if percentage fee is greater than 100', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            await expect(
                EscrowContract.deploy(
                    admin.address,
                    payee.address,
                    purchaser.address,
                    agreedAmount,
                    duration,
                    tokenContract.address,
                    commissioner.address,
                    baseFee,
                    101
                )
            ).to.be.revertedWith('Escrow: percentage fee cannot be greater than 100');
        });
    });

    describe('Close', () => {
        it('should close escrow', async () => {
            const tx = await escrowContract.connect(admin).close();
            await expect(tx).to.emit(escrowContract, 'EscrowClosed');
            expect(await escrowContract.getState()).to.equal(3);
        });

        it('should fail closing escrow if caller is not admin', async () => {
            await expect(escrowContract.connect(purchaser).close()).to.be.revertedWith(
                'Escrow: caller is not the admin'
            );
        });

        it("should fail closing escrow if it is not in 'Active' or 'Locked' state", async () => {
            await escrowContract.connect(admin).close();
            await expect(escrowContract.connect(admin).close()).to.be.revertedWith(
                'Escrow: can only close while active or locked'
            );
        });
    });

    describe('Deposit', () => {
        it('should deposit funds', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            const tx = await escrowContract.connect(purchaser).deposit(depositAmount);

            await expect(tx)
                .to.emit(escrowContract, 'EscrowDeposited')
                .withArgs(purchaser.address, depositAmount);
            expect(await escrowContract.getDepositAmount()).to.equal(depositAmount);
            expect(await tokenContract.balanceOf(escrowContract.address)).to.equal(depositAmount);
        });

        it("should deposit and withdraw funds freely when escrow is in 'Active' state without paying fees", async () => {
            const initialBalance: number = await tokenContract.balanceOf(purchaser.address);
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            expect(await escrowContract.getDepositAmount()).to.equal(depositAmount);
            expect(await tokenContract.balanceOf(escrowContract.address)).to.equal(
                initialBalance - depositAmount
            );

            await escrowContract.connect(purchaser).refund();
            expect(await escrowContract.getDepositAmount()).to.equal(0);
            expect(await tokenContract.balanceOf(purchaser.address)).to.equal(initialBalance);
        });

        it('should fail deposit if purchaser has not approved token transfer', async () => {
            await expect(
                escrowContract.connect(purchaser).deposit(depositAmount)
            ).to.be.revertedWith('ERC20: insufficient allowance');
        });

        it('should fail if purchaser has not enough funds', async () => {
            await tokenContract
                .connect(purchaser)
                .approve(escrowContract.address, depositAmount * 20);
            await expect(
                escrowContract.connect(purchaser).deposit(depositAmount * 20)
            ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
        });

        it("should fail deposit if escrow is not in 'Active' state", async () => {
            await escrowContract.connect(admin).close();

            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await expect(
                escrowContract.connect(purchaser).deposit(depositAmount)
            ).to.be.revertedWith('Escrow: can only deposit while active');
        });

        it('should fail deposit if caller is not a payer', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await expect(escrowContract.connect(payee).deposit(depositAmount)).to.be.revertedWith(
                'Escrow: caller is not a payer'
            );
        });

        it('should fail deposit if amount is not greater than 0', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await expect(escrowContract.connect(purchaser).deposit(0)).to.be.revertedWith(
                'Escrow: can only deposit positive amount'
            );
        });
    });

    describe('Delegation', () => {
        it('should allow delegate to deposit funds', async () => {
            await escrowContract.connect(purchaser).addDelegate(delegate.address);
            await tokenContract.connect(delegate).approve(escrowContract.address, depositAmount);
            const tx = await escrowContract.connect(delegate).deposit(depositAmount);

            await expect(tx)
                .to.emit(escrowContract, 'EscrowDeposited')
                .withArgs(delegate.address, depositAmount);
            expect(await escrowContract.getDepositAmount()).to.equal(depositAmount);
            expect(await tokenContract.balanceOf(escrowContract.address)).to.equal(depositAmount);
        });

        it('should remove delegate', async () => {
            await escrowContract.connect(purchaser).addDelegate(delegate.address);
            await escrowContract.connect(purchaser).removeDelegate(delegate.address);

            await tokenContract.connect(delegate).approve(escrowContract.address, depositAmount);
            await expect(
                escrowContract.connect(delegate).deposit(depositAmount)
            ).to.be.revertedWith('Escrow: caller is not a payer');
        });

        it('should fail if third party has not being delegated to deposit', async () => {
            await expect(
                escrowContract.connect(delegate).deposit(depositAmount)
            ).to.be.revertedWith('Escrow: caller is not a payer');
        });

        it('should fail if delegate is the zero address', async () => {
            await expect(
                escrowContract.connect(purchaser).addDelegate(ethers.constants.AddressZero)
            ).to.be.revertedWith('Escrow: delegate is the zero address');
        });
    });

    describe('Refund enabling', () => {
        it('should enable refund', async () => {
            const tx = await escrowContract.connect(admin).enableRefund();
            await expect(tx).to.emit(escrowContract, 'EscrowRefundEnabled');
        });

        it('should fail enabling refund if caller is not admin', async () => {
            await expect(escrowContract.connect(purchaser).enableRefund()).to.be.revertedWith(
                'Escrow: caller is not the admin'
            );
        });

        it("should fail enabling refunds if escrow is not in 'Active' or 'Locked' state", async () => {
            await escrowContract.connect(admin).close();
            await expect(escrowContract.connect(admin).enableRefund()).to.be.revertedWith(
                'Escrow: can only enable refunds while active or locked'
            );
        });

        it('should return false when calling hasExpired if contract has not expired yet', async () => {
            expect(await escrowContract.hasExpired()).to.false;
        });

        it('should return true when calling hasExpired if contract has expired', async () => {
            await skipToDeadline();
            expect(await escrowContract.hasExpired()).to.true;
        });

        it('should externally enable refund for expired escrow', async () => {
            expect(await escrowContract.hasExpired()).to.false;
            await skipToDeadline();
            await escrowContract.connect(purchaser).enableRefundForExpiredEscrow();
            expect(await escrowContract.hasExpired()).to.true;
        });

        it('should fail externally enabling refund for expired escrow if escrow has not expired', async () => {
            expect(await escrowContract.hasExpired()).to.false;
            await expect(escrowContract.enableRefundForExpiredEscrow()).to.be.revertedWith(
                'Escrow: can only externally enable refund when escrow has expired'
            );
        });
    });

    describe('Refund', () => {
        it('should refund funds to purchaser', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            const initialBalance = await tokenContract.balanceOf(purchaser.address);

            await escrowContract.connect(admin).enableRefund();
            const tx = await escrowContract.connect(purchaser).refund();
            await tx.wait();
            expect(tx)
                .emit(escrowContract, 'EscrowRefunded')
                .withArgs(purchaser.address, depositAmount);

            expect(await tokenContract.balanceOf(purchaser.address)).to.be.greaterThan(
                initialBalance
            );
        });

        it('should refund funds to delegate', async () => {
            await tokenContract.connect(delegate).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).addDelegate(delegate.address);
            await escrowContract.connect(delegate).deposit(depositAmount);
            const delegateInitialBalance = await tokenContract.balanceOf(delegate.address);
            const purchaserInitialBalance = await tokenContract.balanceOf(purchaser.address);

            await escrowContract.connect(admin).enableRefund();
            const tx = await escrowContract.connect(delegate).refund();
            await tx.wait();
            expect(tx)
                .emit(escrowContract, 'EscrowRefunded')
                .withArgs(delegate.address, depositAmount);

            expect(await tokenContract.balanceOf(delegate.address)).to.be.greaterThan(
                delegateInitialBalance
            );
            expect(await tokenContract.balanceOf(purchaser.address)).to.be.equal(
                purchaserInitialBalance
            );
        });

        it('should refund purchaser and delegate funds if both have deposited', async () => {
            await escrowContract.connect(purchaser).addDelegate(delegate.address);
            await tokenContract
                .connect(purchaser)
                .approve(escrowContract.address, depositAmount / 2);
            await tokenContract
                .connect(delegate)
                .approve(escrowContract.address, depositAmount / 4);
            await escrowContract.connect(purchaser).deposit(depositAmount / 2);
            await escrowContract.connect(delegate).deposit(depositAmount / 4);

            await escrowContract.connect(admin).enableRefund();
            let tx = await escrowContract.connect(purchaser).refund();
            await tx.wait();
            expect(tx)
                .emit(escrowContract, 'EscrowRefunded')
                .withArgs(purchaser.address, depositAmount / 2);

            tx = await escrowContract.connect(delegate).refund();
            await tx.wait();
            expect(tx)
                .emit(escrowContract, 'Refunded')
                .withArgs(delegate.address, depositAmount / 4);
        });

        it("refundAllowed should return true if state is 'Refunding'", async () => {
            const tx = await escrowContract.connect(admin).enableRefund();

            await expect(tx).to.emit(escrowContract, 'EscrowRefundEnabled');
            expect(await escrowContract.hasExpired()).to.false;
            expect(await escrowContract.getState()).to.equal(2);
            expect(await escrowContract.refundAllowed()).to.true;
        });
    });

    describe('Withdraw', () => {
        it('should withdraw funds', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            const initialBalance = await tokenContract.balanceOf(payee.address);

            await escrowContract.connect(admin).close();
            const tx = await escrowContract.connect(payee).withdraw();
            await tx.wait();
            expect(tx).emit(escrowContract, 'Withdrawn').withArgs(depositAmount);

            expect(await tokenContract.balanceOf(payee.address)).to.be.greaterThan(initialBalance);
        });

        it('should fail withdrawing funds if not payee', async () => {
            await expect(escrowContract.connect(purchaser).withdraw()).to.be.revertedWith(
                'Escrow: caller is not the payee'
            );
        });

        it("should fail withdrawing funds if escrow is not in 'Closed' state", async () => {
            await expect(escrowContract.connect(payee).withdraw()).to.be.revertedWith(
                'Escrow: can only withdraw while closed'
            );
        });

        it("withdrawAllowed should return true if state is 'Closed'", async () => {
            expect(await escrowContract.withdrawalAllowed()).to.false;
            await escrowContract.connect(admin).close();
            expect(await escrowContract.withdrawalAllowed()).to.true;
        });
    });

    describe('Fees', () => {
        it('should pay fees on withdrawal', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);

            await escrowContract.connect(admin).close();
            await escrowContract.connect(payee).withdraw();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(
                calculateFee(depositAmount)
            );
            expect(await tokenContract.balanceOf(payee.address)).to.equal(
                depositAmount - calculateFee(depositAmount)
            );
        });

        it('should pay fees on refund', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            await escrowContract.connect(purchaser).addDelegate(delegate.address);
            await tokenContract.connect(delegate).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(delegate).deposit(depositAmount);
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);

            await escrowContract.connect(admin).enableRefund();
            await escrowContract.connect(purchaser).refund();
            await escrowContract.connect(delegate).refund();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(
                calculateFee(depositAmount) * 2
            );
        });

        it('should pay fees equal to deposit amount if base fee is equal to deposited amount', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            escrowContract = await EscrowContract.deploy(
                admin.address,
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenContract.address,
                commissioner.address,
                depositAmount,
                percentageFee
            );
            await escrowContract.deployed();

            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);

            await escrowContract.connect(admin).close();
            await escrowContract.connect(payee).withdraw();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(depositAmount);
        });

        it('should pay fees equal to deposit amount if base fee is greater than deposited amount', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            escrowContract = await EscrowContract.deploy(
                admin.address,
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenContract.address,
                commissioner.address,
                depositAmount + 1,
                percentageFee
            );
            await escrowContract.deployed();

            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);

            await escrowContract.connect(admin).close();
            await escrowContract.connect(payee).withdraw();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(depositAmount);
        });

        it('should pay fees equal to deposit amount if percentage fee is 100', async () => {
            EscrowContract = await ethers.getContractFactory(ContractName.ESCROW);
            escrowContract = await EscrowContract.deploy(
                admin.address,
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenContract.address,
                commissioner.address,
                baseFee,
                100
            );
            await escrowContract.deployed();

            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);

            await escrowContract.connect(admin).close();
            await escrowContract.connect(payee).withdraw();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(depositAmount);
        });

        it('should update commission address', async () => {
            await tokenContract.connect(purchaser).approve(escrowContract.address, depositAmount);
            await escrowContract.connect(purchaser).deposit(depositAmount);
            await escrowContract.connect(admin).updateCommissioner(anotherCommissioner.address);

            await escrowContract.connect(admin).close();
            await escrowContract.connect(payee).withdraw();
            expect(await tokenContract.balanceOf(commissioner.address)).to.equal(0);
            expect(await tokenContract.balanceOf(anotherCommissioner.address)).to.equal(
                calculateFee(depositAmount)
            );
        });

        it('should fail updating commission address if caller is not admin', async () => {
            await expect(
                escrowContract.connect(purchaser).updateCommissioner(anotherCommissioner.address)
            ).to.be.revertedWith('Escrow: caller is not the admin');
        });

        it('should fail updating commission address if new address is zero address', async () => {
            await expect(
                escrowContract.connect(admin).updateCommissioner(ethers.constants.AddressZero)
            ).to.be.revertedWith('Escrow: commissioner is the zero address');
        });
    });
});
