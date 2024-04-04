/* eslint-disable import/no-extraneous-dependencies */
import { FakeContract, smock } from '@defi-wonderland/smock';
import { BigNumber, Contract, Event, Wallet } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { MaterialManager } from '../typechain-types';

describe('OrderTrade.sol', () => {
    chai.use(smock.matchers);
    let productCategoryManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
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

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1),
    } as MaterialManager.MaterialStructOutput;

    const _createOrderTrade = async (deadline?: number): Promise<void> => {
        const OrderTrade = await ethers.getContractFactory('OrderTrade');
        orderTradeContract = await OrderTrade.deploy(1, productCategoryManagerContractFake.address, materialManagerContractFake.address,
            documentManagerContractFake.address, supplier.address, customer.address, commissioner.address, externalUrl,
            deadline || paymentDeadline, deadline || (deadline || documentDeliveryDeadline),
            arbiter.address, deadline || shippingDeadline, deadline || deliveryDeadline, escrowContractFake.address,
            enumerableFiatManagerContractFake.address,
        );
        await orderTradeContract.deployed();
    };

    before(async () => {
        [admin, supplier, customer, commissioner, arbiter] = await ethers.getSigners();
        productCategoryManagerContractFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerContractFake.getProductCategoryExists.returns((value: number) => value <= 10);
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((value: number) => value <= 10);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        enumerableFiatManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableFiatManagerContractFake.contains.returns((value: string) => fiats.includes(value[0]));
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        escrowContractFake = await smock.fake('Escrow');
    });

    beforeEach(async () => {
        await _createOrderTrade();
    });

    describe('Getters', () => {
        it('should get order trade information', async () => {
            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, _escrow]
                = await orderTradeContract.getTrade();
            expect(_tradeId)
                .to
                .equal(1);
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

        it('should get trade type', async () => {
            expect(await orderTradeContract.getTradeType())
                .to
                .equal(1);
        });
    });

    describe('Updates', () => {
        it('should update the payment deadline', async () => {
            const newPaymentDeadline: number = 1000;
            const tx = await orderTradeContract.connect(supplier)
                .updatePaymentDeadline(newPaymentDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , _paymentDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(supplier.address);
            expect(_paymentDeadline)
                .to
                .equal(newPaymentDeadline);
        });

        it('should update the document delivery deadline', async () => {
            const newDocumentDeliveryDeadline: number = 2000;
            const tx = await orderTradeContract.connect(commissioner)
                .updateDocumentDeliveryDeadline(newDocumentDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , _documentDeliveryDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(commissioner.address);
            expect(_documentDeliveryDeadline)
                .to
                .equal(newDocumentDeliveryDeadline);
        });

        it('should update the arbiter', async () => {
            const newArbiter: string = Wallet.createRandom().address;
            const tx = await orderTradeContract.connect(commissioner)
                .updateArbiter(newArbiter);
            const receipt = await tx.wait();
            const [, , , , , , , , , , _arbiter] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0])
                .to
                .equal(commissioner.address);
            expect(_arbiter)
                .to
                .equal(newArbiter);
        });

        it('should update the shipping deadline', async () => {
            const newShippingDeadline: number = 4000;
            const tx = await orderTradeContract.connect(admin)
                .updateShippingDeadline(newShippingDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , _shippingDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_shippingDeadline)
                .to
                .equal(newShippingDeadline);
        });

        it('should update the delivery deadline', async () => {
            const newDeliveryDeadline: number = 5000;
            const tx = await orderTradeContract.connect(admin)
                .updateDeliveryDeadline(newDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , , _deliveryDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_deliveryDeadline)
                .to
                .equal(newDeliveryDeadline);
        });
    });

    describe('Order lines', () => {
        it('should add, get and update an order line', async () => {
            const tx = await orderTradeContract.connect(supplier)
                .addLine(1, 100, [10, 0, fiats[0]]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];
            expect(lineId)
                .to
                .equal(1);

            const result = await orderTradeContract.getLine(lineId);
            expect(result[0]).to.deep.equal([lineId, 1, 0, true]);
            expect(result[1]).to.deep.equal([100, [10, 0, fiats[0]]]);

            const updateTx = await orderTradeContract.connect(commissioner)
                .updateLine(lineId, 2, 200, [20, 0, fiats[1]]);
            const updateReceipt = await updateTx.wait();
            expect(updateReceipt.events.find((event: Event) => event.event === 'OrderLineUpdated').args[0])
                .to
                .equal(lineId);

            const newResult = await orderTradeContract.getLine(lineId);
            expect(newResult[0]).to.deep.equal([lineId, 2, 0, true]);
            expect(newResult[1]).to.deep.equal([200, [20, 0, fiats[1]]]);

            await orderTradeContract.connect(supplier)
                .addLine(3, 30, [20, 2, fiats[0]]);

            const lineCounter = await orderTradeContract.getLineCounter();
            expect(lineCounter)
                .to
                .equal(2);
        });

        it('should assign a material to an order line', async () => {
            const tx = await orderTradeContract.connect(supplier).addLine(1, 100, [10, 0, fiats[0]]);
            await tx.wait();

            const assignTx = await orderTradeContract.connect(supplier).assignMaterial(1, 1);
            const assignReceipt = await assignTx.wait();

            const line = await orderTradeContract.getLine(1);
            expect(line[0]).to.deep.equal([1, 1, 1, true]);
            expect(line[1]).to.deep.equal([100, [10, 0, fiats[0]]]);
            expect(assignReceipt.events.find((event: Event) => event.event === 'MaterialAssigned').args[0]).to.equal(1);
        });

        it('should get an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.getLine(100))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should add an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .confirmOrder();

            await expect(orderTradeContract.connect(admin)
                .addLine(1, 100, [10, 0, fiats[0]]))
                .to
                .be
                .revertedWith('OrderTrade: The order has already been confirmed, therefore it cannot be changed');
        });

        it('should add an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await expect(orderTradeContract.connect(admin)
                .addLine(1, 100, [10, 0, 'nonExistingFiat']))
                .to
                .be
                .revertedWith('OrderTrade: Fiat has not been registered');
        });

        it('should update an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.connect(admin)
                .updateLine(1, 1, 200, [20, 0, fiats[0]]))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should update an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .confirmOrder();

            await expect(orderTradeContract.connect(admin)
                .updateLine(1, 1, 200, [20, 0, fiats[0]]))
                .to
                .be
                .revertedWith('OrderTrade: The order has already been confirmed, therefore it cannot be changed');
        });

        it('should update an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await orderTradeContract.connect(admin)
                .addLine(1, 100, [10, 0, fiats[0]]);
            await expect(orderTradeContract.connect(admin)
                .updateLine(1, 1, 200, [20, 0, 'non existing fiat']))
                .to
                .be
                .revertedWith('OrderTrade: Fiat has not been registered');
        });

        it('should assign a material to an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.connect(supplier).assignMaterial(1, 1))
                .to
                .be
                .rejectedWith('Trade: Line does not exist');
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
            const [, , , , , , hasSupplierSigned, hasCommissionerSigned] = await orderTradeContract.getTrade();

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
            const [, , , , , , hasSupplierSigned] = await orderTradeContract.getTrade();
            expect(hasSupplierSigned).to.true;

            await orderTradeContract.connect(commissioner)
                .updatePaymentDeadline(2000);
            const [, , , , , , updatedHasSupplierSigned] = await orderTradeContract.getTrade();
            expect(updatedHasSupplierSigned).to.false;
        });
    });

    describe('Order expiration', () => {
        it('should return whether a deadline has passed', async () => {
            await _createOrderTrade(Date.now() + 1000000);
            expect(await orderTradeContract.connect(supplier).haveDeadlinesExpired())
                .to
                .equal(false);

            await orderTradeContract.connect(supplier).updateDocumentDeliveryDeadline(100);
            await orderTradeContract.connect(commissioner).confirmOrder();
            expect(await orderTradeContract.connect(supplier).haveDeadlinesExpired())
                .to
                .equal(true);
        });

        it('should change escrow status when enforcing deadlines on an order with expired deadlines', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(3);
        });

        it('should not change escrow status when enforcing deadlines on an order with unexpired deadlines', async () => {
            await _createOrderTrade(Date.now() + 1000000);
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(2);
        });

        it('should not change escrow status when enforcing deadlines on non-confirmed escrow', async () => {
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(0);
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

        it('should get status EXPIRED when a deadline has passed', async () => {
            await orderTradeContract.connect(supplier)
                .updatePaymentDeadline(1);
            await orderTradeContract.connect(commissioner)
                .confirmOrder();
            await orderTradeContract.connect(commissioner)
                .enforceDeadlines();

            expect(await orderTradeContract.getNegotiationStatus())
                .to
                .equal(3);
        });
    });
});
