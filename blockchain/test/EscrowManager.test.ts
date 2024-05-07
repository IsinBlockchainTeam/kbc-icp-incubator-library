import { Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('EscrowManager.sol', () => {
    let escrowManagerContract: Contract;
    let tokenContract: Contract;
    let admin: SignerWithAddress, payee: SignerWithAddress,
        purchaser: SignerWithAddress, other: SignerWithAddress,
        commissioner: SignerWithAddress;
    const agreedAmount: number = 1000;
    const depositAmount: number = 120;
    const duration: number = 60 * 60 * 24 * 30; // 30 days
    const baseFee: number = 20;
    const percentageFee: number = 1;

    beforeEach(async () => {
        [admin, payee, purchaser, other, commissioner] = await ethers.getSigners();

        const EscrowManager = await ethers.getContractFactory('EscrowManager');
        escrowManagerContract = await EscrowManager.deploy(commissioner.address, baseFee, percentageFee);
        await escrowManagerContract.deployed();

        const Token = await ethers.getContractFactory('MyToken');
        tokenContract = await Token.deploy(depositAmount * 10);
        await tokenContract.deployed();
        await tokenContract.transfer(purchaser.address, depositAmount * 2);
    });

    async function getPayeeFromEscrowId(escrowId: number): Promise<string> {
        const escrowAddress = await escrowManagerContract.getEscrow(escrowId);
        const escrowContract = await ethers.getContractAt('Escrow', escrowAddress);
        return escrowContract.getPayee();
    }

    async function registerNewEscrow(payee: SignerWithAddress, purchaser: SignerWithAddress, agreedAmount: number, duration: number): Promise<number> {
        const tx = await escrowManagerContract.registerEscrow(
            payee.address,
            purchaser.address,
            agreedAmount,
            duration,
            tokenContract.address,
        );
        const receipt = await tx.wait();
        return receipt.events.find((event: Event) => event.event === 'EscrowRegistered')
            .args
            .id
            .toNumber();
    }

    describe('EscrowManager', () => {
        it('should fail creating an escrow manager if commissioner is the zero address', async () => {
            const EscrowManager = await ethers.getContractFactory('EscrowManager');
            await expect(EscrowManager.deploy(ethers.constants.AddressZero, baseFee, percentageFee))
                .to
                .be
                .revertedWith('EscrowManager: commissioner is the zero address');
        });

        it('should fail creating an escrow manager if commissioner is percentageFee is greater than 100', async () => {
            const EscrowManager = await ethers.getContractFactory('EscrowManager');
            await expect(EscrowManager.deploy(commissioner.address, baseFee, 101))
                .to
                .be
                .revertedWith('EscrowManager: percentage fee cannot be greater than 100');
        });

        it('should update commissioner address', async () => {
            const id = await registerNewEscrow(payee, purchaser, agreedAmount, duration);

            const tx = await escrowManagerContract.updateCommissioner(other.address);
            expect(tx)
                .to
                .emit(escrowManagerContract, 'CommissionerUpdated')
                .withArgs(other.address);
            expect(await escrowManagerContract.getCommissioner())
                .to
                .equal(other.address);

            const escrowAddress = await escrowManagerContract.getEscrow(id);
            const escrowContract = await ethers.getContractAt('Escrow', escrowAddress);
            expect(await escrowContract.getCommissioner())
                .to
                .equal(other.address);
        });

        it('should not update commission address for escrows with state \'Refunding\' or \'Closed\' where funds have been withdrawn', async () => {
            const firstEscrowId = await registerNewEscrow(payee, purchaser, agreedAmount, duration);
            const secondEscrowId = await registerNewEscrow(payee, purchaser, agreedAmount, duration);
            const thirdEscrowId = await registerNewEscrow(payee, purchaser, agreedAmount, duration);

            // STATE: ACTIVE
            const firstEscrowAddress = await escrowManagerContract.getEscrow(firstEscrowId);
            const firstEscrowContract = await ethers.getContractAt('Escrow', firstEscrowAddress);

            // STATE: CLOSED - funds available
            const secondEscrowAddress = await escrowManagerContract.getEscrow(secondEscrowId);
            const secondEscrowContract = await ethers.getContractAt('Escrow', secondEscrowAddress);
            await tokenContract.connect(purchaser)
                .approve(secondEscrowAddress, depositAmount);
            await secondEscrowContract.connect(purchaser)
                .deposit(depositAmount);
            await secondEscrowContract.connect(admin)
                .close();

            // STATE: CLOSED - no funds
            const thirdEscrowAddress = await escrowManagerContract.getEscrow(thirdEscrowId);
            const thirdEscrowContract = await ethers.getContractAt('Escrow', thirdEscrowAddress);
            await thirdEscrowContract.connect(admin)
                .close();

            await escrowManagerContract.connect(admin)
                .updateCommissioner(other.address);
            expect(await firstEscrowContract.connect(purchaser)
                .getCommissioner())
                .to
                .equal(other.address);
            expect(await secondEscrowContract.connect(purchaser)
                .getCommissioner())
                .to
                .equal(other.address);
            expect(await thirdEscrowContract.connect(purchaser)
                .getCommissioner())
                .to
                .equal(commissioner.address);
        });

        it('should update base fee', async () => {
            const tx = await escrowManagerContract.updateBaseFee(30);
            expect(tx)
                .to
                .emit(escrowManagerContract, 'BaseFeeUpdated')
                .withArgs(30);
            expect(await escrowManagerContract.getBaseFee())
                .to
                .equal(30);
        });

        it('should update percentage fee', async () => {
            const tx = await escrowManagerContract.updatePercentageFee(2);
            expect(tx)
                .to
                .emit(escrowManagerContract, 'PercentageFeeUpdated')
                .withArgs(2);
            expect(await escrowManagerContract.getPercentageFee())
                .to
                .equal(2);
        });
    });

    describe('Escrow creation', () => {
        it('should create an escrow', async () => {
            const tx = await escrowManagerContract.registerEscrow(
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                tokenContract.address,
            );

            const receipt = await tx.wait();
            const event = receipt.events.find((event: Event) => event.event === 'EscrowRegistered');
            const id = event.args.id.toNumber();

            expect(id)
                .to
                .equal(1);
            expect(tx)
                .to
                .emit(escrowManagerContract, 'EscrowRegistered')
                .withArgs(id, payee, purchaser, commissioner);

            const escrowAddress = await escrowManagerContract.getEscrow(id);
            expect(escrowAddress)
                .to
                .not
                .equal(ethers.constants.AddressZero);
            const escrowContract = await ethers.getContractAt('Escrow', escrowAddress);

            expect(await escrowContract.getPayee())
                .to
                .equal(payee.address);
            expect(await escrowContract.getPurchaser())
                .to
                .equal(purchaser.address);
            expect(await escrowContract.getDuration())
                .to
                .equal(duration);
            expect(await escrowContract.getTokenAddress())
                .to
                .equal(tokenContract.address);
        });

        it('should return IDs of all escrow involving a specific purchaser', async () => {
            await registerNewEscrow(
                payee,
                purchaser,
                agreedAmount,
                duration,
            );
            await registerNewEscrow(
                payee,
                other,
                agreedAmount,
                duration,
            );
            await registerNewEscrow(
                other,
                purchaser,
                agreedAmount,
                duration,
            );

            const purchaserIds = await escrowManagerContract.getEscrowIdsOfPurchaser(purchaser.address);
            expect(purchaserIds.length)
                .to
                .equal(2);
            expect(await getPayeeFromEscrowId(purchaserIds[0]))
                .to
                .equal(payee.address);
            expect(await getPayeeFromEscrowId(purchaserIds[1]))
                .to
                .equal(other.address);

            const otherIds = await escrowManagerContract.getEscrowIdsOfPurchaser(other.address);
            expect(otherIds.length)
                .to
                .equal(1);
            expect(await getPayeeFromEscrowId(otherIds[0]))
                .to
                .equal(payee.address);

            const payeeIds = await escrowManagerContract.getEscrowIdsOfPurchaser(payee.address);
            expect(payeeIds.length)
                .to
                .equal(0);
        });

        it('should fail escrow registration if payee is zero address', async () => {
            await expect(escrowManagerContract.registerEscrow(
                ethers.constants.AddressZero,
                purchaser.address,
                agreedAmount,
                duration,
                tokenContract.address,
            ))
                .to
                .be
                .revertedWith('EscrowManager: payee is the zero address');
        });

        it('should fail escrow registration if purchaser is zero address', async () => {
            await expect(escrowManagerContract.registerEscrow(
                payee.address,
                ethers.constants.AddressZero,
                agreedAmount,
                duration,
                tokenContract.address,
            ))
                .to
                .be
                .revertedWith('EscrowManager: purchaser is the zero address');
        });

        it('should fail escrow registration if token address is zero address', async () => {
            await expect(escrowManagerContract.registerEscrow(
                payee.address,
                purchaser.address,
                agreedAmount,
                duration,
                ethers.constants.AddressZero,
            ))
                .to
                .be
                .revertedWith('EscrowManager: token address is the zero address');
        });
    });
});
