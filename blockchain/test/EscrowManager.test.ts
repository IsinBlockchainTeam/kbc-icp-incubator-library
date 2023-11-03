import {ethers} from 'hardhat';
import {Contract} from 'ethers';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from "chai";

describe("EscrowManager", () => {
    let escrowManagerContract: Contract;
    let admin: SignerWithAddress, payer: SignerWithAddress, beneficiary: SignerWithAddress;
    const duration = 60 * 60 * 24 * 30; // 30 days
    const depositAmount = ethers.utils.parseEther('100');

    beforeEach(async () => {
        [admin, payer, beneficiary] = await ethers.getSigners();

        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy([admin.address]);
        await escrowManagerContract.deployed();
    });

    describe("Escrow registration", () => {
        it("should register escrow", async () => {
            const tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            expect(id).to.equal(0);
            await expect(tx).to.emit(escrowManagerContract, 'EscrowRegistered').withArgs(id, beneficiary.address, payer.address);
        });

        it("should increment id when registering escrows", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const firstId = await tx.wait().then((tx: any) => tx.events[0].args.id);
            expect(firstId).to.equal(0);

            tx = await escrowManagerContract.connect(beneficiary).registerEscrow(payer.address, beneficiary.address, duration);
            const secondId = await tx.wait().then((tx: any) => tx.events[0].args.id);
            expect(secondId).to.equal(1);
        });

        it("should retrieve escrow correctly", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);
            expect(id).to.equal(0);

            const escrow = await escrowManagerContract.getEscrow(id);
            expect(escrow.state).to.equal(0);
            expect(escrow.beneficiary).to.equal(beneficiary.address);
            expect(escrow.payer).to.equal(payer.address);
            expect(escrow.depositAmount).to.equal(0);
            expect(escrow.duration).to.equal(duration);
        });

        it("should fail escrow registration if beneficiary is zero address", async () => {
            await expect(escrowManagerContract.connect(payer).registerEscrow(ethers.constants.AddressZero, payer.address, duration)).to.be.revertedWith("EscrowManager: beneficiary is the zero address");
        });

        it("should fail escrow registration if payer is zero address", async () => {
            await expect(escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, ethers.constants.AddressZero, duration)).to.be.revertedWith("EscrowManager: payer is the zero address");
        });
    });

    describe("Close", () => {
        it("should close escrow", async () => {
            let tx = await escrowManagerContract.connect(admin).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            tx = await escrowManagerContract.connect(admin).close(id);
            await expect(tx).to.emit(escrowManagerContract, 'Closed').withArgs(id);
            expect(await escrowManagerContract.getState(id)).to.equal(2);
        });

        it("should fail closing escrow if caller is not admin", async () => {
            let tx = await escrowManagerContract.connect(admin).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await expect(escrowManagerContract.connect(payer).close(id)).to.be.revertedWith("EscrowManager: caller is not the admin");
        });

        it("should fail closing escrow if it does not exist", async () => {
            const nonExistingId = 10;
            await expect(escrowManagerContract.connect(admin).close(nonExistingId)).to.be.revertedWith("EscrowManager: escrow does not exist");
        });

        it("should fail closing escrow if it is not in 'Active' state", async () => {
            let tx = await escrowManagerContract.connect(admin).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await escrowManagerContract.connect(admin).close(id)
            await expect(escrowManagerContract.connect(admin).close(id)).to.be.revertedWith("EscrowManager: can only close while active");
        });
    });

    describe("Deposit", () => {
        it("should deposit funds", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            tx = await escrowManagerContract.connect(payer).deposit(id, { value: depositAmount });

            await expect(tx).to.emit(escrowManagerContract, 'Deposited').withArgs(id, depositAmount);
            expect(await escrowManagerContract.getDepositAmount(id)).to.equal(depositAmount);
        });

        it("should fail deposit if escrow does not exist", async () => {
            const nonExistentId = 10;

            await expect(escrowManagerContract.connect(payer).deposit(nonExistentId, { value: depositAmount })).to.be.revertedWith("EscrowManager: escrow does not exist");
        });

        it("should fail deposit if escrow is not in 'Active' state", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await escrowManagerContract.connect(payer).deposit(id, { value: depositAmount });
            await escrowManagerContract.connect(admin).close(id);

            await expect(escrowManagerContract.connect(payer).deposit(id, { value: depositAmount })).to.be.revertedWith("EscrowManager: can only deposit while active");
        });
    });

    describe("Refund enabling", () => {
        it("should enable refund", async () => {
            let tx = await escrowManagerContract.connect(admin).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            tx = await escrowManagerContract.connect(admin).enableRefund(id);
            await expect(tx).to.emit(escrowManagerContract, 'RefundEnabled').withArgs(id);
        });

        it("should fail enabling refund if caller is not admin", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await expect(escrowManagerContract.connect(payer).enableRefund(id)).to.be.revertedWith("EscrowManager: caller is not the admin");
        });

        it("should fail enabling refunds if escrow does not exist", async () => {
            const nonExistentId = 10;

            await expect(escrowManagerContract.connect(admin).enableRefund(nonExistentId)).to.be.revertedWith("EscrowManager: escrow does not exist");
        });

        it("should fail enabling refunds if escrow is not in 'Active' state", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await escrowManagerContract.connect(admin).close(id);

            await expect(escrowManagerContract.connect(admin).enableRefund(id)).to.be.revertedWith("EscrowManager: can only enable refunds while active");
        });
    });

    describe("Refund", () => {
        it("hasExpired should return false if contract has not expired yet", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            expect(await escrowManagerContract.connect(admin).hasExpired(id)).to.false;
        });

        it("refundAllowed should return true if state is 'Refunding'", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);
            tx = await escrowManagerContract.connect(admin).enableRefund(id);

            await expect(tx).to.emit(escrowManagerContract, 'RefundEnabled').withArgs(id);
            expect(await escrowManagerContract.hasExpired(id)).to.false;
            expect(await escrowManagerContract.getState(id)).to.equal(1);
            expect(await escrowManagerContract.refundAllowed(id)).to.true;
        });


        it("should refund funds", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);
            await escrowManagerContract.connect(payer).deposit(id, { value: depositAmount });
            const initialBalance = await payer.getBalance();

            await escrowManagerContract.connect(admin).enableRefund(id);
            tx = await escrowManagerContract.connect(payer).refund(id);
            await tx.wait();
            expect(tx).emit(escrowManagerContract, 'Refunded').withArgs(id, depositAmount);

            expect(await payer.getBalance()).to.be.greaterThan(initialBalance);
        });


    });

    describe("Withdraw", () => {
        it("should withdraw funds", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);
            await escrowManagerContract.connect(payer).deposit(id, { value: depositAmount });
            const initialBalance = await beneficiary.getBalance();

            await escrowManagerContract.connect(admin).close(id);
            tx = await escrowManagerContract.connect(beneficiary).withdraw(id);
            await tx.wait();
            expect(tx).emit(escrowManagerContract, 'Withdrawn').withArgs(id, depositAmount);

            expect(await beneficiary.getBalance()).to.be.greaterThan(initialBalance);
        });

        it("should fail withdrawing funds if not beneficiary", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await expect(escrowManagerContract.connect(payer).withdraw(id)).to.be.revertedWith("EscrowManager: caller is not the beneficiary");
        });

        it("should fail withdrawing funds if escrow is not in 'Closed' state", async () => {
            let tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            const id = await tx.wait().then((tx: any) => tx.events[0].args.id);

            await expect(escrowManagerContract.connect(beneficiary).withdraw(id)).to.be.revertedWith("EscrowManager: can only withdraw while closed");
        });
    });


    /*

    describe("Roles", () => {
        it("should return correct beneficiary", async () => {
            const duration = 60 * 60 * 24 * 30; // 30 days
            const tx = await escrowManagerContract.connect(payer).registerEscrow(beneficiary.address, payer.address, duration);
            expect(await escrowManagerContract.beneficiary()).to.equal(beneficiary.address);
        });
    });
*/
});