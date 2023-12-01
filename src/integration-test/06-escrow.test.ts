import {JsonRpcProvider} from "@ethersproject/providers";
import {BigNumber, Contract, ethers, Signer, utils} from "ethers";
import {EscrowManagerDriver} from "../drivers/EscrowManagerDriver";
import {EscrowManagerService} from "../services/EscrowManagerService";
import {EscrowDriver} from "../drivers/EscrowDriver";
import {EscrowService} from "../services/EscrowService";
import {
    ADMIN_PRIVATE_KEY,
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    ESCROW_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS, OTHER_PRIVATE_KEY, SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY
} from "./config";
import { MyToken__factory } from "../smart-contracts";
import {EscrowStatus} from "../types/EscrowStatus";

describe("Escrow Manager", () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let escrowManagerDriver: EscrowManagerDriver;
    let escrowManagerService: EscrowManagerService;

    const payee: string = SUPPLIER_ADDRESS;
    const purchaser: string = CUSTOMER_ADDRESS;
    const agreedAmount: number = 1000;
    const duration: number = 100;
    let escrowAddress: string;

    let escrowService: EscrowService;
    let escrowDriver: EscrowDriver;
    let adminEscrowService: EscrowService;
    let adminEscrowDriver: EscrowDriver;
    let payeeEscrowDriver: EscrowDriver;
    let payeeEscrowService: EscrowService;
    let purchaserEscrowDriver: EscrowDriver;
    let purchaserEscrowService: EscrowService;

    let purchaserSigner: Signer;

    const tokenAddress: string = MY_TOKEN_CONTRACT_ADDRESS;
    let tokenContract: Contract;

    beforeAll(async () => {
        provider = new JsonRpcProvider();
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
    });

    const _defineServices = () => {
        expect(utils.isAddress(escrowAddress)).toBeTruthy();

        signer = new ethers.Wallet(SUPPLIER_PRIVATE_KEY, provider);
        adminEscrowDriver = new EscrowDriver(
            signer,
            escrowAddress,
        );
        adminEscrowService = new EscrowService(adminEscrowDriver);

        signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
        payeeEscrowDriver = new EscrowDriver(
            signer,
            escrowAddress,
        );
        payeeEscrowService = new EscrowService(payeeEscrowDriver);

        purchaserSigner = new ethers.Wallet(CUSTOMER_PRIVATE_KEY, provider);
        purchaserEscrowDriver = new EscrowDriver(
            purchaserSigner,
            escrowAddress,
        );
        purchaserEscrowService = new EscrowService(purchaserEscrowDriver);

        signer = new ethers.Wallet(OTHER_PRIVATE_KEY, provider);
        escrowDriver = new EscrowDriver(
            purchaserSigner,
            escrowAddress,
        );
        escrowService = new EscrowService(escrowDriver);
    }


    describe("Withdraw scenario", () => {
        it("should create an escrow", async () => {
            await escrowManagerService.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
            const id: number = (await escrowManagerService.getEscrowsId(purchaser))[0];
            expect(id).toEqual(0);

            escrowAddress = await escrowManagerService.getEscrow(id);
            _defineServices();
        });

        it('should retrieve data correctly', async () => {
            expect(await escrowDriver.getPayee()).toEqual(payee);
            expect(await escrowDriver.getPurchaser()).toEqual(purchaser);
            expect(await escrowDriver.getAgreedAmount()).toEqual(agreedAmount);
            expect(await escrowDriver.getDuration()).toEqual(duration);
            expect(await escrowDriver.getTokenAddress()).toEqual(tokenAddress);
            expect(await escrowDriver.getState()).toEqual(EscrowStatus.ACTIVE);
            expect(await escrowDriver.getDepositAmount()).toEqual(0);
        });

        it('should deposit funds', async () => {
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(500));
            await tokenContract.connect(purchaserSigner).approve(escrowAddress, 120);
            await purchaserEscrowService.deposit(120);
            expect(await escrowService.getDepositAmount()).toEqual(120);
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(500 - 120));
        });

        it('should close escrow', async () => {
            await expect(purchaserEscrowService.close()).rejects.toThrow("Escrow: caller is not the admin");

            await adminEscrowService.close();
            expect(await adminEscrowService.getState()).toEqual(EscrowStatus.CLOSED);
            await tokenContract.connect(purchaserSigner).approve(escrowAddress, 100);
            await expect(purchaserEscrowService.deposit(100)).rejects.toThrow("Escrow: can only deposit while active");
        });

        it('should withdraw funds', async () => {
            //await expect(purchaserEscrowService.withdraw()).rejects.toThrow("Escrow: caller is not the admin");
            //await expect(adminEscrowService.withdraw()).rejects.toThrow("Escrow: can only refund while refunding");
            expect(await escrowService.getBaseFee()).toEqual(20);
            expect(await escrowService.getPercentageFee()).toEqual(1);
            expect(await escrowService.getDepositAmount()).toEqual(120);
            // TODO: fix this test
            //await payeeEscrowService.withdraw();
            //expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(200));
        });
    });

    describe("Refund scenario", () => {
        it('should create an escrow', async () => {
            await escrowManagerService.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
            const id: number = (await escrowManagerService.getEscrowsId(purchaser))[1];
            expect(id).toEqual(1);

            escrowAddress = await escrowManagerService.getEscrow(id);
            _defineServices();
        });

        it('should deposit funds', async () => {
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(500 - 120));
            await tokenContract.connect(purchaserSigner).approve(escrowAddress, 120);
            await purchaserEscrowService.deposit(120);
            expect(await escrowService.getDepositAmount()).toEqual(120);
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(500 - 240));
        });

        it('should enable refund', async () => {
            await expect(purchaserEscrowService.enableRefund()).rejects.toThrow("Escrow: caller is not the admin");

            await adminEscrowService.enableRefund();
            expect(await adminEscrowService.getState()).toEqual(EscrowStatus.REFUNDING);
            await tokenContract.connect(purchaserSigner).approve(escrowAddress, 100);
            await expect(purchaserEscrowService.deposit(100)).rejects.toThrow("Escrow: can only deposit while active");
        });

        it('should refund funds', async () => {
            await purchaserEscrowService.refund();
            expect(await tokenContract.balanceOf(purchaser)).toEqual(BigNumber.from(500 - 120 - 21));
        });
    });
});