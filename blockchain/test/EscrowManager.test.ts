import {ethers} from 'hardhat';
import {Contract} from 'ethers';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from "chai";

describe("EscrowManager", () => {
    let escrowManagerContract: Contract;
    let owner: SignerWithAddress, payer: SignerWithAddress, beneficiary: SignerWithAddress;

    beforeEach(async () => {
        [owner, payer, beneficiary] = await ethers.getSigners();

        const duration = 60 * 60 * 24 * 30; // 30 days
        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy(beneficiary.address, duration);
        await escrowManagerContract.deployed();
    });

    describe("RefundEscrow parent contract", () => {
        it("should return correct beneficiary", async () => {
            expect(await escrowManagerContract.beneficiary()).to.equal(beneficiary.address);
        });

    });

    describe("Deposit", () => {
        it("should deposit funds", async () => {
            const depositAmount = 100;
            const tx = await escrowManagerContract.deposit(payer.address, { value: depositAmount });

            await expect(tx).to.emit(escrowManagerContract, 'Deposited').withArgs(payer.address, depositAmount);
            expect(await escrowManagerContract.depositsOf(payer.address)).to.equal(depositAmount);
        });
    });

    describe("Withdrawal", () => {
        it("hasExpired should return false if contract has not expired yet", async () => {
            expect(await escrowManagerContract.hasExpired()).to.false;
        });

        it("withdrawalAllowed should return true if state is 'Closed' and hasExpired is false", async () => {
            await escrowManagerContract.close();

            expect(await escrowManagerContract.hasExpired()).to.false;
            expect(await escrowManagerContract.withdrawalAllowed2()).to.true;
        });
    });

});