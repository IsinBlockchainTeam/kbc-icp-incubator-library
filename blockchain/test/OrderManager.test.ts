/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let orderManagerContract: Contract;
let enumerableFiatManagerContract: Contract;
let enumerableProductCategoryManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let supplier: SignerWithAddress;
let customer: SignerWithAddress;
let orderManager: SignerWithAddress;
let otherAccount: SignerWithAddress;
let orderCounterId: BigNumber;

describe('OrderManager', () => {
    const rawOrder = {
        externalUrl: 'https://testurl.ch',
    };

    before(async () => {
        [owner, admin, supplier, customer, orderManager, otherAccount] = await ethers.getSigners();

        const OrderManager = await ethers.getContractFactory(ContractName.ORDER_MANAGER);
        const EnumerableFiatManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);
        const EnumerableProductCategoryManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);

        enumerableFiatManagerContract = await EnumerableFiatManager.deploy();
        await enumerableFiatManagerContract.deployed();
        await enumerableFiatManagerContract.add('CHF');

        enumerableProductCategoryManagerContract = await EnumerableProductCategoryManager.deploy();
        await enumerableProductCategoryManagerContract.deployed();
        await enumerableProductCategoryManagerContract.add('categoryA');
        await enumerableProductCategoryManagerContract.add('categoryB');

        orderManagerContract = await OrderManager.deploy([admin.address], enumerableFiatManagerContract.address, enumerableProductCategoryManagerContract.address);
        await orderManagerContract.deployed();
    });

    describe('registerOrder', () => {
        it('should register and retrieve a order', async () => {
            await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);

            const order = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
            expect(order.id).to.equal(orderCounterId.toNumber());
            expect(order.supplier).to.equal(supplier.address);
            expect(order.customer).to.equal(customer.address);
            expect(order.offeree).to.equal(customer.address);
            expect(order.offeror).to.equal(supplier.address);
            expect(order.offerorSigned).to.be.undefined;
            expect(order.offereeSigned).to.be.undefined;
            expect(order.externalUrl).to.equal(rawOrder.externalUrl);
        });

        it('should register a order - FAIL (sender is neither supplier nor customer)', async () => {
            await expect(orderManagerContract.connect(otherAccount).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl)).to.be.revertedWith('Sender is neither supplier nor customer');
        });

        it('should try to retrieve a order - FAIL(Order does not exist)', async () => {
            await expect(orderManagerContract.connect(supplier).getOrderInfo(supplier.address, 50)).to.be.revertedWith('Order does not exist');
        });

        it('should emit OrderRegistered event', async () => {
            orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
            await expect(orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl))
                .to.emit(orderManagerContract, 'OrderRegistered')
                .withArgs(orderCounterId.toNumber() + 1, supplier.address);
        });

        it('should check if order exists', async () => {
            await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
            const exist = await orderManagerContract.connect(supplier).orderExists(supplier.address, orderCounterId.toNumber());
            expect(exist).to.be.true;
        });
    });

    describe('manipulate order by adding/updating lines', () => {
        let orderLineCounterId: BigNumber;
        const initialProductCategory = 'categoryA';
        const quantity = BigNumber.from(10);
        const price = {
            amount: BigNumber.from(100),
            decimals: BigNumber.from(2),
            fiat: 'CHF',
        };

        before(async () => {
            await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
            orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
        });

        describe('addOrderLine', () => {
            it('should add and retrieve a order line', async () => {
                await orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price);

                const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                const savedOrderLine = await orderManagerContract.connect(supplier).getOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(savedOrderLine.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(savedOrderLine.productCategory.toString()).to.equal(initialProductCategory);
                expect(savedOrderLine.quantity.toNumber()).to.equal(quantity.toNumber());
                expect(savedOrderLine.price.fiat).to.equal(price.fiat);
                expect(savedOrderLine.price.amount.toNumber()).to.equal(price.amount);
                expect(savedOrderLine.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should emit OrderLineAdded event', async () => {
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                await expect(orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price))
                    .to.emit(orderManagerContract, 'OrderLineAdded')
                    .withArgs(orderCounterId.toNumber(), supplier.address, orderLineCounterId.toNumber() + 1);
            });

            it('should add a order line - FAIL (Order does not exist)', async () => {
                const otherOrderId = 50;
                await expect(orderManagerContract.connect(supplier).addOrderLine(supplier.address, otherOrderId, initialProductCategory, quantity, price)).to.be.revertedWith('Order does not exist');
            });

            it('should add a order line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(orderManagerContract.connect(otherAccount).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should add a order line - FAIL (The fiat of the order line isn\'t registered)', async () => {
                const oldFiat = price.fiat;
                price.fiat = 'FIAT';
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                await expect(orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price)).to.be.revertedWith("The fiat of the order line isn't registered");
                price.fiat = oldFiat;
            });

            it('should add a order line - FAIL (The order has been confirmed, it cannot be changed)', async () => {
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                orderManagerContract.connect(supplier).confirmOrder(supplier.address, orderCounterId);
                orderManagerContract.connect(customer).confirmOrder(supplier.address, orderCounterId);

                await expect(orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price)).to.be.revertedWith('The order has been confirmed, it cannot be changed');
            });
        });

        describe('getOrderLine', () => {
            before(async () => {
                await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                await orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price);
                const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];
            });

            it('should get an order line', async () => {
                const cl = await orderManagerContract.connect(supplier).getOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(cl.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(cl.productCategory.toString()).to.equal(initialProductCategory);
                expect(cl.quantity.toNumber()).to.equal(quantity.toNumber());

                expect(cl.price.fiat).to.equal(price.fiat);
                expect(cl.price.amount.toNumber()).to.equal(price.amount);
                expect(cl.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should get an order line - FAIL (Order does not exist)', async () => {
                const otherOrderId = 50;
                await expect(orderManagerContract.connect(supplier).getOrderLine(supplier.address, otherOrderId, orderLineCounterId.toNumber())).to.be.revertedWith('Order does not exist');
            });
        });

        describe('orderLineExists', () => {
            it('should check if an order line exists', async () => {
                await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                await orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), initialProductCategory, quantity, price);
                const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                const exist = await orderManagerContract.connect(supplier).orderLineExists(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(exist).to.be.true;
            });
        });

        describe('updateOrderLine', () => {
            // ...orderLine non effettua una deep copy dei nested object (price)
            //     const updatedOrderLine = { ...orderLine, productCategory: 'categoryUpdated' };
            const updatedProductCategory = 'categoryUpdated';

            before(async () => {
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
                await orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId.toNumber(), updatedProductCategory, quantity, price);
                const { lineIds } = await orderManagerContract.connect(supplier).getOrderInfo(supplier.address, orderCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];
            });

            it('should update a order line', async () => {
                await orderManagerContract.connect(supplier).updateOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber(), updatedProductCategory, quantity, price);

                const savedOrderLine = await orderManagerContract.connect(supplier).getOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(savedOrderLine.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(savedOrderLine.productCategory.toString()).to.not.equal(initialProductCategory);
                expect(savedOrderLine.productCategory.toString()).to.equal(updatedProductCategory);
            });

            it('should emit OrderLineUpdated event', async () => {
                await expect(orderManagerContract.connect(supplier).updateOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber(), updatedProductCategory, quantity, price))
                    .to.emit(orderManagerContract, 'OrderLineUpdated')
                    .withArgs(orderCounterId.toNumber(), supplier.address, orderLineCounterId.toNumber());
            });

            it('should update a order line - FAIL (Order does not exist)', async () => {
                const otherOrderId = 50;
                await expect(orderManagerContract.connect(supplier).updateOrderLine(supplier.address, otherOrderId, orderLineCounterId.toNumber(), updatedProductCategory, quantity, price)).to.be.revertedWith('Order does not exist');
            });

            it('should update a order line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(orderManagerContract.connect(otherAccount).updateOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber(), updatedProductCategory, quantity, price)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should update a order line - FAIL (The fiat of the order line isn\'t registered)', async () => {
                const oldFiat = price.fiat;
                price.fiat = 'FIAT';
                await expect(orderManagerContract.connect(supplier).updateOrderLine(supplier.address, orderCounterId.toNumber(), orderLineCounterId.toNumber(), updatedProductCategory, quantity, price)).to.be.revertedWith("The fiat of the order line isn't registered");
                price.fiat = oldFiat;
            });
        });

        describe('getOrderStatus', () => {
            let orderStatus;

            before(async () => {
                await orderManagerContract.connect(supplier).registerOrder(supplier.address, customer.address, customer.address, rawOrder.externalUrl);
                orderCounterId = await orderManagerContract.connect(supplier).getOrderCounter(supplier.address);
            });

            it('should try to get order status - FAIL (Order does not exist)', async () => {
                await expect(orderManagerContract.connect(supplier).getOrderStatus(supplier.address, 50)).to.be.revertedWith('Order does not exist');
            });

            it('neither supplier nor customer have been confirmed the order, result = INITIALIZED', async () => {
                orderStatus = await orderManagerContract.connect(supplier).getOrderStatus(supplier.address, orderCounterId.toNumber());
                expect(orderStatus).to.equal(0);
            });

            it('the supplier should change the order status by adding line, result = PENDING', async () => {
                await orderManagerContract.connect(supplier).addOrderLine(supplier.address, orderCounterId, initialProductCategory, quantity, price);
                orderStatus = await orderManagerContract.connect(supplier).getOrderStatus(supplier.address, orderCounterId.toNumber());
                expect(orderStatus).to.equal(1);
            });

            it('the customer should change again the order by adding a line, result = PENDING', async () => {
                await orderManagerContract.connect(customer).addOrderLine(supplier.address, orderCounterId, initialProductCategory, quantity, price);
                orderStatus = await orderManagerContract.connect(customer).getOrderStatus(supplier.address, orderCounterId.toNumber());
                expect(orderStatus).to.equal(1);
            });

            it('the supplier should try to confirm the order - FAIL (Only an offeree or an offeror can confirm the order)', async () => {
                await expect(orderManagerContract.connect(otherAccount).confirmOrder(supplier.address, orderCounterId)).to.be.revertedWith('Only an offeree or an offeror can confirm the order');
            });

            it('the supplier should confirm the order, result = CONFIRMED', async () => {
                await orderManagerContract.connect(supplier).confirmOrder(supplier.address, orderCounterId);
                orderStatus = await orderManagerContract.connect(supplier).getOrderStatus(supplier.address, orderCounterId.toNumber());
                expect(orderStatus).to.equal(2);
            });
        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check that the sender is supplier or customer', async () => {
            const isParty = await orderManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, orderCounterId, customer.address);
            expect(isParty).to.be.true;
        });

        it('should check that the sender is supplier or customer', async () => {
            const isParty = await orderManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, orderCounterId, otherAccount.address);
            expect(isParty).to.be.false;
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
            await expect(orderManagerContract.connect(supplier).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(orderManagerContract.connect(supplier).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
