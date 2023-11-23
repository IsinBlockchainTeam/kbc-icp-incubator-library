import {Contract, Event} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ethers} from "hardhat";
import {expect} from "chai";

describe("EscrowManager.sol", () => {
    let escrowManagerContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress, purchaser: SignerWithAddress, other: SignerWithAddress
    const agreedAmount: number = 1000;
    const duration: number = 60 * 60 * 24 * 30; // 30 days
    const tokenAddress: string = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    beforeEach(async () => {
        [admin, payee, purchaser, other] = await ethers.getSigners();

        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy([admin.address]);
        await escrowManagerContract.deployed();
    });

    async function getPayeeFromEscrowId(escrowId: number): Promise<string> {
        const escrowAddress = await escrowManagerContract.getEscrow(escrowId);
        const escrowContract = await ethers.getContractAt("Escrow", escrowAddress);
        return escrowContract.getPayee();
    }

    describe("Escrow creation", () => {
        it("should create an escrow", async () => {
            const tx = await escrowManagerContract.registerEscrow(
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenAddress
            );

            const receipt = await tx.wait();
            const event = receipt.events.find((event: Event) => event.event === 'EscrowRegistered');
            const id = event.args.id.toNumber();

            expect(id).to.equal(0);
            expect(tx).to.emit(escrowManagerContract, 'EscrowRegistered').withArgs(id, payee, purchaser);

            const escrowAddress = await escrowManagerContract.getEscrow(id);
            expect(escrowAddress).to.not.equal(ethers.constants.AddressZero);
            const escrowContract = await ethers.getContractAt("Escrow", escrowAddress);

            expect(await escrowContract.getPayee()).to.equal(payee.address);
            expect(await escrowContract.getPurchaser()).to.equal(purchaser.address);
            expect(await escrowContract.getDuration()).to.equal(duration);
            expect(await escrowContract.getTokenAddress()).to.equal(tokenAddress);
        });

        it("should return IDs of all escrow involving a specific purchaser", async () => {
            await escrowManagerContract.registerEscrow(
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenAddress
            );
            await escrowManagerContract.registerEscrow(
                payee.address,
                other.address,
                agreedAmount,
                duration,
                tokenAddress
            );
            await escrowManagerContract.registerEscrow(
                other.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenAddress
            );

            const purchaserIds = await escrowManagerContract.getEscrowsId(purchaser.address);
            expect(purchaserIds.length).to.equal(2);
            expect(await getPayeeFromEscrowId(purchaserIds[0])).to.equal(payee.address);
            expect(await getPayeeFromEscrowId(purchaserIds[1])).to.equal(other.address);

            const otherIds = await escrowManagerContract.getEscrowsId(other.address);
            expect(otherIds.length).to.equal(1);
            expect(await getPayeeFromEscrowId(otherIds[0])).to.equal(payee.address);

            const payeeIds = await escrowManagerContract.getEscrowsId(payee.address);
            expect(payeeIds.length).to.equal(0);
        });

        it("should fail escrow registration if payee is zero address", async () => {
            await expect(escrowManagerContract.registerEscrow(
                ethers.constants.AddressZero,
                purchaser.address,
                agreedAmount,
                duration,
                tokenAddress
            )).to.be.revertedWith("EscrowManager: payee is the zero address");
        });

        it("should fail escrow registration if purchaser is zero address", async () => {
            await expect(escrowManagerContract.registerEscrow(
                payee.address,
                ethers.constants.AddressZero,
                agreedAmount,
                duration,
                tokenAddress
            )).to.be.revertedWith("EscrowManager: purchaser is the zero address");
        });

        it("should fail escrow registration if token address is zero address", async () => {
            await expect(escrowManagerContract.registerEscrow(
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                ethers.constants.AddressZero
            )).to.be.revertedWith("EscrowManager: token address is the zero address");
        });
    });
});