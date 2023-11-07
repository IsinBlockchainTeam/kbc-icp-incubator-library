import {Contract, Event} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ethers} from "hardhat";
import {expect} from "chai";

describe("EscrowManager.sol", () => {
    let escrowManagerContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress, payer: SignerWithAddress, other: SignerWithAddress
    const duration = 60 * 60 * 24 * 30; // 30 days

    beforeEach(async () => {
        [admin, payee, payer, other] = await ethers.getSigners();

        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy([admin.address]);
        await escrowManagerContract.deployed();
    });

    describe("Escrow creation", () => {
        it("should create an escrow", async () => {
            const tx = await escrowManagerContract.registerEscrow(
                payee.address,
                payer.address,
                duration,
            );

            const receipt = await tx.wait();
            const event = receipt.events.find((event: Event) => event.event === 'EscrowRegistered');
            const id = event.args.id.toNumber();

            expect(id).to.equal(0);
            expect(tx).to.emit(escrowManagerContract, 'EscrowRegistered').withArgs(id, payee, payer);

            const escrowAddress = await escrowManagerContract.getEscrow(id);
            expect(escrowAddress).to.not.equal(ethers.constants.AddressZero);
            const escrowContract = await ethers.getContractAt("Escrow", escrowAddress);

            expect(await escrowContract.getPayee()).to.equal(payee.address);
            expect(await escrowContract.getPayer()).to.equal(payer.address);
            expect(await escrowContract.getDuration()).to.equal(duration);
        });

        it("should return all payees of payer", async () => {
            await escrowManagerContract.registerEscrow(
                payee.address,
                payer.address,
                duration,
            );
            await escrowManagerContract.registerEscrow(
                payee.address,
                other.address,
                duration,
            );
            await escrowManagerContract.registerEscrow(
                other.address,
                payer.address,
                duration,
            );

            const payerPayees = await escrowManagerContract.getPayees(payer.address);
            expect(payerPayees.length).to.equal(2);
            expect(payerPayees[0]).to.equal(payee.address);
            expect(payerPayees[1]).to.equal(other.address);

            const otherPayees = await escrowManagerContract.getPayees(other.address);
            expect(otherPayees.length).to.equal(1);
            expect(otherPayees[0]).to.equal(payee.address);

            const payeePayees = await escrowManagerContract.getPayees(payee.address);
            expect(payeePayees.length).to.equal(0);
        });

        it("should fail escrow registration if payee is zero address", async () => {
            await expect(escrowManagerContract.registerEscrow(
                ethers.constants.AddressZero,
                payer.address,
                duration,
            )).to.be.revertedWith("EscrowManager: payee is the zero address");
        });

        it("should fail escrow registration if payer is zero address", async () => {
            await expect(escrowManagerContract.registerEscrow(
                payee.address,
                ethers.constants.AddressZero,
                duration,
            )).to.be.revertedWith("EscrowManager: payer is the zero address");
        });
    });
});