import {ethers} from 'hardhat';
import {Contract} from 'ethers';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from "chai";

describe("Escrow.sol", () => {
    let escrowContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress, payer: SignerWithAddress;
    const duration = 60 * 60 * 24 * 30; // 30 days
    const depositAmount = ethers.utils.parseEther('100');

    const mineBlocks = async (n: number) => {
        await ethers.provider.send('hardhat_mine', [`0x${n.toString(16)}`]);
    };
    const skipToDeadline = async () => {
        const proposalDeadline = await escrowContract.getDeadline();
        await mineBlocks(Number(proposalDeadline));
    };

    beforeEach(async () => {
        [admin, payee, payer] = await ethers.getSigners();

        const Escrow = await ethers.getContractFactory('Escrow');
        escrowContract = await Escrow.deploy([admin.address], payee.address, payer.address, duration);
        await escrowContract.deployed();
    });

    describe("Escrow", () => {
        it("should retrieve escrow correctly", async () => {
            expect(await escrowContract.getPayee()).to.equal(payee.address);
            expect(await escrowContract.getPayer()).to.equal(payer.address);
            expect(await escrowContract.getDuration()).to.equal(duration);
            expect(await escrowContract.getState()).to.equal(0);
            expect(await escrowContract.getDepositAmount()).to.equal(0);
        });
    });

    describe("Close", () => {
        it("should close escrow", async () => {
            const tx = await escrowContract.connect(admin).close();
            await expect(tx).to.emit(escrowContract, 'Closed');
            expect(await escrowContract.getState()).to.equal(2);
        });

        it("should fail closing escrow if caller is not admin", async () => {
            await expect(escrowContract.connect(payer).close()).to.be.revertedWith("Escrow: caller is not the admin");
        });

        it("should fail closing escrow if it is not in 'Active' state", async () => {
            await escrowContract.connect(admin).close()
            await expect(escrowContract.connect(admin).close()).to.be.revertedWith("Escrow: can only close while active");
        });
    });

    describe("Deposit", () => {
        it("should deposit funds", async () => {
            const tx = await escrowContract.connect(payer).deposit({ value: depositAmount });

            await expect(tx).to.emit(escrowContract, 'Deposited').withArgs(depositAmount);
            expect(await escrowContract.getDepositAmount()).to.equal(depositAmount);
        });

        it("should fail deposit if escrow is not in 'Active' state", async () => {
            await escrowContract.connect(payer).deposit({ value: depositAmount });
            await escrowContract.connect(admin).close();

            await expect(escrowContract.connect(payer).deposit({ value: depositAmount })).to.be.revertedWith("Escrow: can only deposit while active");
        });
    });

    describe("Refund enabling", () => {
        it("should enable refund", async () => {
            const tx = await escrowContract.connect(admin).enableRefund();
            await expect(tx).to.emit(escrowContract, 'RefundEnabled');
        });

        it("should fail enabling refund if caller is not admin", async () => {
            await expect(escrowContract.connect(payer).enableRefund()).to.be.revertedWith("Escrow: caller is not the admin");
        });

        it("should fail enabling refunds if escrow is not in 'Active' state", async () => {
            await escrowContract.connect(admin).close();
            await expect(escrowContract.connect(admin).enableRefund()).to.be.revertedWith("Escrow: can only enable refunds while active");
        });

        it("should return false when calling hasExpired if contract has not expired yet", async () => {
            expect(await escrowContract.hasExpired()).to.false;
        });

        it("should return true when calling hasExpired if contract has expired", async () => {
            await skipToDeadline();
            expect(await escrowContract.hasExpired()).to.true;
        });

        it("should externally enable refund for expired escrow", async () => {
            expect(await escrowContract.hasExpired()).to.false;
            await skipToDeadline();
            await escrowContract.connect(payer).enableRefundForExpiredEscrow();
            expect(await escrowContract.hasExpired()).to.true;
        });

        it("should fail externally enabling refund for expired escrow if escrow has not expired", async () => {
            expect(await escrowContract.hasExpired()).to.false;
            await expect(escrowContract.enableRefundForExpiredEscrow()).to.be.revertedWith("Escrow: can only externally enable refund when escrow has expired");
        });
    });

    describe("Refund", () => {
        it("should refund funds", async () => {
            await escrowContract.connect(payer).deposit({ value: depositAmount });
            const initialBalance = await payer.getBalance();

            await escrowContract.connect(admin).enableRefund();
            const tx = await escrowContract.connect(payer).refund();
            await tx.wait();
            expect(tx).emit(escrowContract, 'Refunded').withArgs(depositAmount);

            expect(await payer.getBalance()).to.be.greaterThan(initialBalance);
        });

        it("refundAllowed should return true if state is 'Refunding'", async () => {
            const tx = await escrowContract.connect(admin).enableRefund();

            await expect(tx).to.emit(escrowContract, 'RefundEnabled');
            expect(await escrowContract.hasExpired()).to.false;
            expect(await escrowContract.getState()).to.equal(1);
            expect(await escrowContract.refundAllowed()).to.true;
        });
    });

    describe("Withdraw", () => {
        it("should withdraw funds", async () => {
            await escrowContract.connect(payer).deposit({ value: depositAmount });
            const initialBalance = await payee.getBalance();

            await escrowContract.connect(admin).close();
            const tx = await escrowContract.connect(payee).withdraw();
            await tx.wait();
            expect(tx).emit(escrowContract, 'Withdrawn').withArgs(depositAmount);

            expect(await payee.getBalance()).to.be.greaterThan(initialBalance);
        });

        it("should fail withdrawing funds if not payee", async () => {
            await expect(escrowContract.connect(payer).withdraw()).to.be.revertedWith("Escrow: caller is not the payee");
        });

        it("should fail withdrawing funds if escrow is not in 'Closed' state", async () => {
            await expect(escrowContract.connect(payee).withdraw()).to.be.revertedWith("Escrow: can only withdraw while closed");
        });

        it("withdrawAllowed should return true if state is 'Closed'", async () => {
            expect(await escrowContract.withdrawalAllowed()).to.false;
            await escrowContract.connect(admin).close();
            expect(await escrowContract.withdrawalAllowed()).to.true;
        });
    });
});