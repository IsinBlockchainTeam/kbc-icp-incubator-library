import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers, Signer, utils } from 'ethers';
import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';
import { EscrowManagerService } from '../services/EscrowManagerService';
import { EscrowDriver } from '../drivers/EscrowDriver';
import { EscrowService } from '../services/EscrowService';
import {
    ADMIN_PRIVATE_KEY,
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY, DELEGATE_ADDRESS, DELEGATE_PRIVATE_KEY,
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
    let initialExporterBalance: number;
    let initialPurchaserBalance: number;
    let initialDelegateBalance: number;

    const payee: string = SUPPLIER_ADDRESS;
    const purchaser: string = CUSTOMER_ADDRESS;
    const delegate: string = DELEGATE_ADDRESS;
    const agreedAmount: number = 1000;
    const duration: number = 100;
    let escrowAddress: string;

    let escrowService: EscrowService;
    let adminEscrowService: EscrowService;
    let exporterEscrowService: EscrowService;
    let importerEscrowService: EscrowService;
    let delegateEscrowService: EscrowService;

    let purchaserSigner: Signer;
    let delegateSigner: Signer;

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
        await tokenContract.transfer(delegate, 10);
        escrowInitialIndex = await escrowManagerService.getEscrowCounter();
        initialExporterBalance = (await tokenContract.balanceOf(payee)).toNumber();
        initialPurchaserBalance = (await tokenContract.balanceOf(purchaser)).toNumber();
        initialDelegateBalance = (await tokenContract.balanceOf(delegate)).toNumber();
    });

    const _defineServices = () => {
        expect(utils.isAddress(escrowAddress))
            .toBeTruthy();

        signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        adminEscrowService = new EscrowService(new EscrowDriver(
            signer,
            escrowAddress,
        ));

        exporterEscrowService = new EscrowService(new EscrowDriver(
            new ethers.Wallet(SUPPLIER_PRIVATE_KEY, provider),
            escrowAddress,
        ));

        purchaserSigner = new ethers.Wallet(CUSTOMER_PRIVATE_KEY, provider);
        importerEscrowService = new EscrowService(new EscrowDriver(
            purchaserSigner,
            escrowAddress,
        ));

        delegateSigner = new ethers.Wallet(DELEGATE_PRIVATE_KEY, provider);
        delegateEscrowService = new EscrowService(new EscrowDriver(
            delegateSigner,
            escrowAddress,
        ));

        escrowService = new EscrowService(new EscrowDriver(
            new ethers.Wallet(OTHER_PRIVATE_KEY, provider),
            escrowAddress,
        ));
    };

    describe('Withdraw scenario', () => {
        it('should create an escrow', async () => {
            await escrowManagerService.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
            const idsOfPurchaser: number[] = await escrowManagerService.getEscrowIdsOfPurchaser(purchaser);
            const id: number = idsOfPurchaser[idsOfPurchaser.length - 1];
            expect(id)
                .toEqual(escrowInitialIndex);

            escrowAddress = await escrowManagerService.getEscrow(id);
            _defineServices();
        });

        it('should retrieve data correctly', async () => {
            expect(await escrowService.getOwner())
                .toEqual(payee);
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

        it('should allow a delegate to deposit some funds', async () => {
            await importerEscrowService.addDelegate(delegate);
            await tokenContract.connect(delegateSigner).approve(escrowAddress, 10);
            await delegateEscrowService.deposit(10);
            expect(await tokenContract.balanceOf(delegate)).toEqual(BigNumber.from(initialDelegateBalance - 10));
        });

        it('should allow delegate to withdraw funds while state is \'Active\' without paying fees', async () => {
            await delegateEscrowService.refund();
            expect(await tokenContract.balanceOf(delegate)).toEqual(BigNumber.from(initialDelegateBalance));
        });

        it('should lock the escrow', async () => {
            await adminEscrowService.lock();
            expect(await adminEscrowService.getState()).toEqual(EscrowStatus.LOCKED);
        });

        it('should not allow depositing or refunding while locked', async () => {
            await tokenContract.connect(purchaserSigner).approve(escrowAddress, 10);
            await expect(importerEscrowService.deposit(10)).rejects.toThrow('Escrow: can only deposit while active');

            await expect(importerEscrowService.refund()).rejects.toThrow('Escrow: can only refund when allowed');
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

            await exporterEscrowService.withdraw();
            expect(await tokenContract.balanceOf(payee)).toEqual(BigNumber.from(initialExporterBalance + 120 - 20 - 1));
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(initialPurchaserBalance - 120));
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
