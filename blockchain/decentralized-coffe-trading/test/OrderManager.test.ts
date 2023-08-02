/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let contractManagerContract: Contract;
let orderManagerContract: Contract;
let enumerableFiatManagerContract: Contract;
let enumerableProductCategoryManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let supplier: SignerWithAddress;
let customer: SignerWithAddress;
let otherAccount: SignerWithAddress;
let orderCounterId: BigNumber;
let orderLineCounterId: BigNumber;
let contractCounterId: BigNumber;
let contractLineCounterId: BigNumber;

describe('OrderManager', () => {
    const rawOrder = {
        externalUrl: 'https://testurl.ch',
    };
    const rawOrderLine = {
        id: BigNumber.from(0),
        contractLineId: BigNumber.from(0),
        quantity: BigNumber.from(100),
        exists: true,
    };

    before(async () => {
        [owner, admin, supplier, customer, otherAccount] = await ethers.getSigners();

        const OrderManager = await ethers.getContractFactory(ContractName.ORDER_MANAGER);
        const ContractManager = await ethers.getContractFactory(ContractName.CONTRACT_MANAGER);
        const EnumerableFiatManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);
        const EnumerableProductCategoryManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);

        enumerableFiatManagerContract = await EnumerableFiatManager.deploy();
        await enumerableFiatManagerContract.deployed();
        await enumerableFiatManagerContract.add('CHF');

        enumerableProductCategoryManagerContract = await EnumerableProductCategoryManager.deploy();
        await enumerableProductCategoryManagerContract.deployed();

        contractManagerContract = await ContractManager.deploy([admin.address], enumerableFiatManagerContract.address, enumerableProductCategoryManagerContract.address);
        await contractManagerContract.deployed();

        orderManagerContract = await OrderManager.deploy([admin.address], contractManagerContract.address);
        await orderManagerContract.deployed();

        const contractLine = {
            id: BigNumber.from(0),
            productCategory: 'categoryA',
            quantity: BigNumber.from(10),
            price: {
                amount: BigNumber.from(100),
                decimals: BigNumber.from(2),
                fiat: 'CHF',
            },
            exists: true,
        };

        await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, 'externalUrl');
        contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
        await contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine);
        const { lineIds } = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
        contractLineCounterId = lineIds.slice(-1)[0];
        rawOrderLine.contractLineId = contractLineCounterId;
    });

    describe('registerOrder', () => {
        it('should register an order', async () => {
            await orderManagerContract.connect(customer).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);

            const order = await orderManagerContract.connect(customer).getOrderInfo(supplier.address, orderCounterId.toNumber());
            expect(order.id).to.equal(orderCounterId.toNumber());
            expect(order.contractId).to.equal(contractCounterId.toNumber());
            expect(order.externalUrl).to.equal(rawOrder.externalUrl);
        });

        it('should emit OrderRegistered event', async () => {
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);
            await expect(orderManagerContract.connect(customer).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl))
                .to.emit(orderManagerContract, 'OrderRegistered')
                .withArgs(orderCounterId.toNumber() + 1, supplier.address);
        });

        it('should check if order exists', async () => {
            await orderManagerContract.connect(customer).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);
            const exist = await orderManagerContract.connect(customer).orderExists(supplier.address, orderCounterId.toNumber());
            expect(exist).to.be.true;
        });

        it('should register an order - FAIL (Contract does not exist)', async () => {
            await expect(orderManagerContract.connect(customer).registerOrder(supplier.address, 20, rawOrder.externalUrl)).to.be.revertedWith('Contract does not exist');
        });

        it('should register an order - FAIL (Sender is neither supplier nor customer of the relative contract)', async () => {
            await expect(orderManagerContract.connect(otherAccount).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl)).to.be.revertedWith('Sender is neither supplier nor customer of the relative contract');
        });
    });

    describe('addOrderLine', () => {
        it('should add an order line', async () => {
            await orderManagerContract.connect(customer).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);
            await orderManagerContract.connect(customer).addOrderLine(supplier.address, orderCounterId.toNumber(), rawOrderLine);

            const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
            orderLineCounterId = lineIds.slice(-1)[0];
            expect(orderLineCounterId.toNumber()).to.equal(1);

            const savedOrderLine = await orderManagerContract.connect(customer).getOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
            expect(savedOrderLine.id).to.equal(orderLineCounterId);
            expect(savedOrderLine.contractLineId).to.equal(rawOrderLine.contractLineId);
            expect(savedOrderLine.quantity).to.equal(rawOrderLine.quantity);
        });

        it('should emit OrderLineAdded event', async () => {
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);
            const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
            orderLineCounterId = lineIds.slice(-1)[0];
            await expect(orderManagerContract.connect(customer).addOrderLine(supplier.address, orderCounterId.toNumber(), rawOrderLine))
                .to.emit(orderManagerContract, 'OrderLineAdded')
                .withArgs(orderCounterId.toNumber(), supplier.address, orderLineCounterId.toNumber() + 1);
        });

        it('should add an order line - FAIL (Order does not exist)', async () => {
            const otherOrderId = 50;
            await expect(orderManagerContract.connect(customer).addOrderLine(supplier.address, otherOrderId, rawOrderLine)).to.be.revertedWith('Order does not exist');
        });

        it('should add an order line - FAIL (Sender is neither supplier nor customer of the relative contract)', async () => {
            await expect(orderManagerContract.connect(otherAccount).addOrderLine(supplier.address, orderCounterId.toNumber(), rawOrderLine)).to.be.revertedWith('Sender is neither supplier nor customer of the relative contract');
        });

        it('should add an order line - FAIL (Trying to set an order line that doesn\'t refer to the correct contract line)', async () => {
            const oldContractLineId = rawOrderLine.contractLineId;
            rawOrderLine.contractLineId = BigNumber.from(40);
            await expect(orderManagerContract.connect(customer).addOrderLine(supplier.address, orderCounterId.toNumber(), rawOrderLine)).to.be.revertedWith('Trying to set an order line that doesn\'t refer to the correct contract line');
            rawOrderLine.contractLineId = oldContractLineId;
        });
    });

    describe('getOrderLine', () => {
        before(async () => {
            await orderManagerContract.connect(customer).registerOrder(supplier.address, contractCounterId.toNumber(), rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(customer).getOrderCounter(supplier.address);
            await orderManagerContract.connect(customer).addOrderLine(supplier.address, orderCounterId.toNumber(), rawOrderLine);
            const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
            orderLineCounterId = lineIds.slice(-1)[0];
        });

        it('should get an order line', async () => {
            const ol = await orderManagerContract.connect(customer).getOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
            expect(ol.id).to.equal(orderLineCounterId);
            expect(ol.contractLineId).to.equal(rawOrderLine.contractLineId);
            expect(ol.quantity).to.equal(rawOrderLine.quantity);
        });

        it('should get an order line - FAIL (Order does not exist)', async () => {
            const otherOrderId = 50;
            await expect(orderManagerContract.connect(customer).getOrderLine(supplier.address, otherOrderId, orderLineCounterId.toNumber())).to.be.revertedWith('Order does not exist');
        });

        it('should get an order line - FAIL (Order line does not exist)', async () => {
            const otherOrderLineId = 50;
            await expect(orderManagerContract.connect(supplier).getOrderLine(supplier.address, orderCounterId.toNumber(), otherOrderLineId)).to.be.revertedWith('Order line does not exist');
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await orderManagerContract.connect(owner).addAdmin(admin.address);
            expect(await orderManagerContract.hasRole(await orderManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await orderManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await orderManagerContract.hasRole(await orderManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(orderManagerContract.connect(customer).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(orderManagerContract.connect(customer).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
