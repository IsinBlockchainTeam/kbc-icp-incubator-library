import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers, Signer, utils } from 'ethers';
import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';
import { EscrowManagerService } from '../services/EscrowManagerService';
import { EscrowDriver } from '../drivers/EscrowDriver';
import { EscrowService } from '../services/EscrowService';
import {
    ADMIN_PRIVATE_KEY,
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    ESCROW_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS, NETWORK, OTHER_PRIVATE_KEY, SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
} from './config';
import { MyToken__factory } from '../smart-contracts';
import { EscrowStatus } from '../types/EscrowStatus';

describe('Escrow Manager', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let escrowManagerDriver: EscrowManagerDriver;
    let escrowManagerService: EscrowManagerService;

    let escrowInitialIndex: number;
    let initialPurchaserBalance: number;

    const payee: string = SUPPLIER_ADDRESS;
    const purchaser: string = CUSTOMER_ADDRESS;
    const agreedAmount: number = 1000;
    const duration: number = 100;
    let escrowAddress: string;

    let escrowService: EscrowService;
    let escrowDriver: EscrowDriver;
    let adminEscrowService: EscrowService;
    let adminEscrowDriver: EscrowDriver;
    let exporterEscrowDriver: EscrowDriver;
    let exporterEscrowService: EscrowService;
    let importerEscrowDriver: EscrowDriver;
    let importerEscrowService: EscrowService;

    let purchaserSigner: Signer;

    const tokenAddress: string = MY_TOKEN_CONTRACT_ADDRESS;
    let tokenContract: Contract;

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

        escrowManagerDriver = new EscrowManagerDriver(
            signer,
            ESCROW_MANAGER_CONTRACT_ADDRESS,
        );
        escrowManagerService = new EscrowManagerService(escrowManagerDriver);

        signer = provider.getSigner();
        tokenContract = MyToken__factory.connect(tokenAddress, signer);
        await tokenContract.deployed();
        await tokenContract.transfer(purchaser, 500);
        escrowInitialIndex = await escrowManagerService.getEscrowCounter();
        initialPurchaserBalance = await tokenContract.balanceOf(purchaser);
    });

    const _defineServices = () => {
        expect(utils.isAddress(escrowAddress))
            .toBeTruthy();

        signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        adminEscrowDriver = new EscrowDriver(
            signer,
            escrowAddress,
        );
        adminEscrowService = new EscrowService(adminEscrowDriver);

        signer = new ethers.Wallet(SUPPLIER_PRIVATE_KEY, provider);
        exporterEscrowDriver = new EscrowDriver(
            signer,
            escrowAddress,
        );
        exporterEscrowService = new EscrowService(exporterEscrowDriver);

        purchaserSigner = new ethers.Wallet(CUSTOMER_PRIVATE_KEY, provider);
        importerEscrowDriver = new EscrowDriver(
            purchaserSigner,
            escrowAddress,
        );
        importerEscrowService = new EscrowService(importerEscrowDriver);

        signer = new ethers.Wallet(OTHER_PRIVATE_KEY, provider);
        escrowDriver = new EscrowDriver(
            purchaserSigner,
            escrowAddress,
        );
        escrowService = new EscrowService(escrowDriver);
    };

    describe('Withdraw scenario', () => {

        it('should create an escrow', async () => {
            await escrowManagerService.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
            const idsOfPurchaser: number[] = await escrowManagerService.getEscrowIdsOfPurchaser(purchaser);
            const id: number = idsOfPurchaser[idsOfPurchaser.length - 1]
            expect(id)
                .toEqual(escrowInitialIndex);

            escrowAddress = await escrowManagerService.getEscrow(id);
            _defineServices();
        });

        it('should retrieve data correctly', async () => {
            expect(await escrowService.getOwner())
                .toEqual(purchaser);
            expect(await escrowService.getPayee())
                .toEqual(payee);
            expect(await escrowService.getPurchaser())
                .toEqual(purchaser);
            expect(await escrowService.getAgreedAmount())
                .toEqual(agreedAmount);
            expect(await escrowService.getTokenAddress())
                .toEqual(tokenAddress);
            expect(await escrowService.getState())
                .toEqual(EscrowStatus.ACTIVE);
            expect(await escrowService.getDepositAmount())
                .toEqual(0);
        });

        it('should deposit funds', async () => {
            expect(await tokenContract.balanceOf(purchaser))
                .toEqual(BigNumber.from(initialPurchaserBalance));
            await tokenContract.connect(purchaserSigner)
                .approve(escrowAddress, 120);
            await importerEscrowService.deposit(120);
            expect(await escrowService.getDepositAmount())
                .toEqual(120);
            expect(await tokenContract.balanceOf(purchaser))
                .toEqual(BigNumber.from(initialPurchaserBalance - 120));
        });

        it('should close escrow', async () => {
            await expect(importerEscrowService.close())
                .rejects
                .toThrow('Escrow: caller is not the admin');

            await adminEscrowService.close();
            expect(await adminEscrowService.getState())
                .toEqual(EscrowStatus.CLOSED);
            await tokenContract.connect(purchaserSigner)
                .approve(escrowAddress, 100);
            await expect(importerEscrowService.deposit(100))
                .rejects
                .toThrow('Escrow: can only deposit while active');
        });

        it('should withdraw funds', async () => {
            // await expect(importerEscrowService.withdraw()).rejects.toThrow("Escrow: caller is not the admin");
            // await expect(adminEscrowService.withdraw()).rejects.toThrow("Escrow: can only refund while refunding");
            expect(await escrowService.getBaseFee())
                .toEqual(20);
            expect(await escrowService.getPercentageFee())
                .toEqual(1);
            expect(await escrowService.getDepositAmount())
                .toEqual(120);
            // TODO: fix this test
            // await exporterEscrowService.withdraw();
            // expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(200));
        });
    });

    describe('Refund scenario', () => {
        it('should create an escrow', async () => {
            await escrowManagerService.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
            const idsOdPurchaser: number[] = await escrowManagerService.getEscrowIdsOfPurchaser(purchaser);
            const id: number = idsOdPurchaser[idsOdPurchaser.length - 1];
            expect(id)
                .toEqual(escrowInitialIndex + 1);

            escrowAddress = await escrowManagerService.getEscrow(id);
            _defineServices();
        });

        it('should deposit funds', async () => {
            expect(await tokenContract.balanceOf(purchaser))
                .toEqual(BigNumber.from(initialPurchaserBalance - 120));
            await tokenContract.connect(purchaserSigner)
                .approve(escrowAddress, 120);
            await importerEscrowService.deposit(120);
            expect(await escrowService.getDepositAmount())
                .toEqual(120);
            expect(await tokenContract.balanceOf(purchaser))
                .toEqual(BigNumber.from(initialPurchaserBalance - 240));
        });

        it('should enable refund', async () => {
            await expect(importerEscrowService.enableRefund())
                .rejects
                .toThrow('Escrow: caller is not the admin');

            await adminEscrowService.enableRefund();
            expect(await adminEscrowService.getState())
                .toEqual(EscrowStatus.REFUNDING);
            await tokenContract.connect(purchaserSigner)
                .approve(escrowAddress, 100);
            await expect(importerEscrowService.deposit(100))
                .rejects
                .toThrow('Escrow: can only deposit while active');
        });

        it('should refund funds', async () => {
            await importerEscrowService.refund();
            expect(await tokenContract.balanceOf(purchaser))
                .toEqual(BigNumber.from(initialPurchaserBalance - 120 - 21));
        });
    });
});
