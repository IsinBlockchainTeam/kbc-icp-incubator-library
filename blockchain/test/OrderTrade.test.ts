import { FakeContract, smock } from '@defi-wonderland/smock';
import { Contract, Event, Wallet } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';

describe('OrderTrade.sol', () => {
    chai.use(smock.matchers);
    let enumerableProductCategoryManagerContractFake: FakeContract;
    const categories = ['Arabic 85', 'Excelsa 88'];
    let enumerableFiatManagerContractFake: FakeContract;
    const fiats: string[] = ['fiat1', 'fiat2'];
    let documentManagerContractFake: FakeContract;
    let escrowContractFake: FakeContract;

    let orderTradeContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress,
        customer: SignerWithAddress,
        commissioner: SignerWithAddress, arbiter: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com';
    const paymentDeadline: number = 100;
    const documentDeliveryDeadline: number = 200;
    const shippingDeadline: number = 300;
    const deliveryDeadline: number = 400;

    before(async () => {
        [admin, supplier, customer, commissioner, arbiter] = await ethers.getSigners();
        enumerableProductCategoryManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableProductCategoryManagerContractFake.contains.returns((value: string) => categories.includes(value[0]));
        enumerableFiatManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableFiatManagerContractFake.contains.returns((value: string) => fiats.includes(value[0]));
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        escrowContractFake = await smock.fake('Escrow');
    });

    beforeEach(async () => {
        const OrderTrade = await ethers.getContractFactory('OrderTrade');
        orderTradeContract = await OrderTrade.deploy(0, enumerableProductCategoryManagerContractFake.address,
            documentManagerContractFake.address, supplier.address, customer.address, commissioner.address, externalUrl,
            paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, escrowContractFake.address,
            enumerableFiatManagerContractFake.address,
        );
        await orderTradeContract.deployed();
    });

    describe('Getters', () => {
        it('should get trade type', async () => {
            expect(await orderTradeContract.getTradeType())
                .to
                .equal(1);
        });

        it('should get OrderTrade information', async () => {
            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, _escrow]
                = await orderTradeContract.getOrderTrade();
            expect(_tradeId)
                .to
                .equal(0);
            expect(_supplier)
                .to
                .equal(supplier.address);
            expect(_customer)
                .to
                .equal(customer.address);
            expect(_commissioner)
                .to
                .equal(commissioner.address);
            expect(_externalUrl)
                .to
                .equal(externalUrl);
            expect(_linesId)
                .to
                .deep
                .equal([]);
            expect(_hasSupplierSigned)
                .to
                .equal(false);
            expect(_hasCommissionerSigned)
                .to
                .equal(false);
            expect(_paymentDeadline)
                .to
                .equal(paymentDeadline);
            expect(_documentDeliveryDeadline)
                .to
                .equal(documentDeliveryDeadline);
            expect(_arbiter)
                .to
                .equal(arbiter.address);
            expect(_shippingDeadline)
                .to
                .equal(shippingDeadline);
            expect(_deliveryDeadline)
                .to
                .equal(deliveryDeadline);
            expect(_escrow)
                .to
                .equal(escrowContractFake.address);
        });
    });

    describe('Updates', () => {
        it('should update the payment deadline', async () => {
            const newPaymentDeadline: number = 1000;
            const tx = await orderTradeContract.connect(supplier)
                .updatePaymentDeadline(newPaymentDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , paymentDeadline] = await orderTradeContract.getOrderTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(supplier.address);
            expect(paymentDeadline)
                .to
                .equal(newPaymentDeadline);
        });

        it('should update the document delivery deadline', async () => {
            const newDocumentDeliveryDeadline: number = 2000;
            const tx = await orderTradeContract.connect(commissioner)
                .updateDocumentDeliveryDeadline(newDocumentDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , documentDeliveryDeadline] = await orderTradeContract.getOrderTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(commissioner.address);
            expect(documentDeliveryDeadline)
                .to
                .equal(newDocumentDeliveryDeadline);
        });

        it('should update the arbiter', async () => {
            const newArbiter: string = Wallet.createRandom().address;
            const tx = await orderTradeContract.connect(commissioner)
                .updateArbiter(newArbiter);
            const receipt = await tx.wait();
            const [, , , , , , , , , , arbiter] = await orderTradeContract.getOrderTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(commissioner.address);
            expect(arbiter)
                .to
                .equal(newArbiter);
        });

        it('should update the shipping deadline', async () => {
            const newShippingDeadline: number = 4000;
            const tx = await orderTradeContract.connect(admin)
                .updateShippingDeadline(newShippingDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , shippingDeadline] = await orderTradeContract.getOrderTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(shippingDeadline)
                .to
                .equal(newShippingDeadline);
        });

        it('should update the delivery deadline', async () => {
            const newDeliveryDeadline: number = 5000;
            const tx = await orderTradeContract.connect(admin)
                .updateDeliveryDeadline(newDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , , deliveryDeadline] = await orderTradeContract.getOrderTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(deliveryDeadline)
                .to
                .equal(newDeliveryDeadline);
        });
    });

    describe('Order lines', () => {
        it('should add, get and update an order line', async () => {
            const tx = await orderTradeContract.connect(supplier)
                .addOrderLine([1, 2], categories[0], 100, [10, 0, fiats[0]]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];
            expect(receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0])
                .to
                .equal(lineId);
            expect(lineId)
                .to
                .equal(0);

            const [quantity, orderLinePrice, orderExists] = await orderTradeContract.getOrderLine(lineId);
            const [id, materialsId, productCategory, tradeExists] = await orderTradeContract.getLine(lineId);
            expect(quantity)
                .to
                .equal(100);
            expect(orderLinePrice[0])
                .to
                .equal(10);
            expect(orderLinePrice[1])
                .to
                .equal(0);
            expect(orderLinePrice[2])
                .to
                .equal(fiats[0]);
            expect(orderExists)
                .to
                .equal(true);
            expect(id)
                .to
                .equal(lineId);
            expect(materialsId[0])
                .to
                .equal(1);
            expect(materialsId[1])
                .to
                .equal(2);
            expect(productCategory)
                .to
                .equal(categories[0]);
            expect(tradeExists)
                .to
                .equal(true);

            const updateTx = await orderTradeContract.connect(commissioner)
                .updateOrderLine(lineId, 200, [20, 0, fiats[1]]);
            const updateReceipt = await updateTx.wait();
            expect(updateReceipt.events.find((event: Event) => event.event === 'OrderLineUpdated').args[0])
                .to
                .equal(lineId);
            expect(updateReceipt.events.find((event: Event) => event.event === 'TradeLineUpdated')).to.be.undefined;

            const [updatedQuantity, updatedOrderLinePrice, updatedOrderExists] = await orderTradeContract.getOrderLine(lineId);
            expect(updatedQuantity)
                .to
                .equal(200);
            expect(updatedOrderLinePrice[0])
                .to
                .equal(20);
            expect(updatedOrderLinePrice[1])
                .to
                .equal(0);
            expect(updatedOrderLinePrice[2])
                .to
                .equal(fiats[1]);
            expect(updatedOrderExists)
                .to
                .equal(true);

            const secondTx = await orderTradeContract.connect(supplier)
                .addOrderLine([5, 6], categories[0], 30, [20, 2, fiats[0]]);
            const secondReceipt = await secondTx.wait();
            const secondLineId = secondReceipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];

            const lines = await orderTradeContract.getOrderLines();
            expect(lines.length)
                .to
                .equal(2);
            expect(lines[0])
                .to
                .deep
                .equal([updatedQuantity, updatedOrderLinePrice, orderExists]);
            expect(lines[1])
                .to
                .deep
                .equal([30, [20, 2, fiats[0]], true]);
        });

        it('should get an order line - FAIL(OrderTrade: Order line does not exist)', async () => {
            await expect(orderTradeContract.getOrderLine(1))
                .to
                .be
                .revertedWith('OrderTrade: Order line does not exist');
        });

        it('should add an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .confirmOrder();

            await expect(orderTradeContract.connect(admin)
                .addOrderLine([1, 2], categories[0], 100, [10, 0, fiats[0]]))
                .to
                .be
                .revertedWith('OrderTrade: The order has already been confirmed, therefore it cannot be changed');
        });

        it('should add an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await expect(orderTradeContract.connect(admin)
                .addOrderLine([1, 2], categories[0], 100, [10, 0, 'nonExistingFiat']))
                .to
                .be
                .revertedWith('OrderTrade: Fiat has not been registered');
        });

        it('should update an order line - FAIL(OrderTrade: Order line does not exist)', async () => {
            await expect(orderTradeContract.connect(admin)
                .updateOrderLine(1, 200, [20, 0, fiats[0]]))
                .to
                .be
                .revertedWith('OrderTrade: Order line does not exist');
        });

        it('should update an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .confirmOrder();

            await expect(orderTradeContract.connect(admin)
                .updateOrderLine(0, 200, [20, 0, fiats[0]]))
                .to
                .be
                .revertedWith('OrderTrade: The order has already been confirmed, therefore it cannot be changed');
        });

        it('should update an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await orderTradeContract.connect(admin)
                .addOrderLine([1, 2], categories[0], 100, [10, 0, fiats[0]]);
            await expect(orderTradeContract.connect(admin)
                .updateOrderLine(0, 200, [20, 0, 'nonExistingFiat']))
                .to
                .be
                .revertedWith('OrderTrade: Fiat has not been registered');
        });
    });

    describe('Order confirmation', () => {
        it('should confirm an order', async () => {
            const supplierTx = await orderTradeContract.connect(supplier)
                .confirmOrder();
            const supplierReceipt = await supplierTx.wait();
            const commissionerTx = await orderTradeContract.connect(commissioner)
                .confirmOrder();
            const commissionerReceipt = await commissionerTx.wait();
            const [, , , , , , hasSupplierSigned, hasCommissionerSigned] = await orderTradeContract.getOrderTrade();

            expect(supplierReceipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(supplier.address);
            expect(supplierReceipt.events.find((event: Event) => event.event === 'OrderConfirmed')).to.be.undefined;
            expect(commissionerReceipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(commissioner.address);
            expect(commissionerReceipt.events.find((event: Event) => event.event === 'OrderConfirmed')).to.not.be.undefined;
            expect(hasSupplierSigned)
                .to
                .equal(true);
            expect(hasCommissionerSigned)
                .to
                .equal(true);
        });

        it('should remove confirmation when a constraint is updated by the other party', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            const [, , , , , , hasSupplierSigned] = await orderTradeContract.getOrderTrade();
            expect(hasSupplierSigned).to.true;

            await orderTradeContract.connect(commissioner)
                .updatePaymentDeadline(2000);
            const [, , , , , , updatedHasSupplierSigned] = await orderTradeContract.getOrderTrade();
            expect(updatedHasSupplierSigned).to.false;
        });
    });

    describe('Negotiation status', () => {
        it('should get status INITIALIZED when no one has confirmed', async () => {
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(0);
        });

        it('should get status PENDING when only supplier has confirmed', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(1);
        });

        it('should get status PENDING when only commissioner has confirmed', async () => {
            await orderTradeContract.connect(commissioner)
                .confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(1);
        });

        it('should get status COMPLETED when both supplier and commissioner have confirmed', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(2);
        });
    });
});
