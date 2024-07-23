/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
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
    let escrowManagerContractFake: FakeContract;
    let tokenContractFake: FakeContract;
    let enumerableUnitManagerContractFake: FakeContract;
    let escrowFakeContract: FakeContract;

    let orderTradeContract: Contract;
    let admin: SignerWithAddress,
        supplier: SignerWithAddress,
        customer: SignerWithAddress,
        commissioner: SignerWithAddress,
        arbiter: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com/';
    const metadataHash: string = 'metadataHash';
    const startDate = new Date();
    const paymentDeadline = new Date(startDate.setDate(startDate.getDate() + 1)).getTime();
    const documentDeliveryDeadline = new Date(startDate.setDate(new Date(paymentDeadline).getDate() + 1)).getTime();
    const shippingDeadline = new Date(startDate.setDate(new Date(documentDeliveryDeadline).getDate() + 1)).getTime();
    const deliveryDeadline = new Date(startDate.setDate(new Date(shippingDeadline).getDate() + 1)).getTime();
    const units = ['BG', 'KGM', 'H87'];
    const agreedAmount = 1000;

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1)
    } as MaterialManager.MaterialStructOutput;

    const _createOrderTrade = async (deadline?: number): Promise<void> => {
        const OrderTrade = await ethers.getContractFactory('OrderTrade');
        orderTradeContract = await OrderTrade.deploy(
            1,
            productCategoryManagerContractFake.address,
            materialManagerContractFake.address,
            documentManagerContractFake.address,
            enumerableUnitManagerContractFake.address,
            supplier.address,
            customer.address,
            commissioner.address,
            externalUrl,
            metadataHash,
            deadline || paymentDeadline,
            deadline || documentDeliveryDeadline,
            arbiter.address,
            deadline || shippingDeadline,
            deadline || deliveryDeadline,
            agreedAmount,
            tokenContractFake.address,
            enumerableFiatManagerContractFake.address,
            escrowManagerContractFake.address
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
        documentManagerContractFake.registerDocument.returns(() => 1);
        tokenContractFake = await smock.fake('MyToken');
        enumerableUnitManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableUnitManagerContractFake.contains.returns((value: string) => units.includes(value[0]));
        escrowManagerContractFake = await smock.fake(ContractName.ESCROW_MANAGER);
        escrowFakeContract = await smock.fake(ContractName.ESCROW);
        escrowManagerContractFake.registerEscrow.returns(escrowFakeContract.address);
    });

    beforeEach(async () => {
        await _createOrderTrade();
    });

    describe('Getters', () => {
        it('should get order trade information', async () => {
            const [
                _tradeId,
                _supplier,
                _customer,
                _commissioner,
                _externalUrl,
                _linesId,
                _hasSupplierSigned,
                _hasCommissionerSigned,
                _paymentDeadline,
                _documentDeliveryDeadline,
                _arbiter,
                _shippingDeadline,
                _deliveryDeadline,
                _escrow
            ] = await orderTradeContract.getTrade();
            expect(_tradeId).to.equal(1);
            expect(_supplier).to.equal(supplier.address);
            expect(_customer).to.equal(customer.address);
            expect(_commissioner).to.equal(commissioner.address);
            expect(_externalUrl).to.equal(`${externalUrl}1`);
            expect(_linesId).to.deep.equal([]);
            expect(_hasSupplierSigned).to.equal(false);
            expect(_hasCommissionerSigned).to.equal(false);
            expect(_paymentDeadline).to.equal(paymentDeadline);
            expect(_documentDeliveryDeadline).to.equal(documentDeliveryDeadline);
            expect(_arbiter).to.equal(arbiter.address);
            expect(_shippingDeadline).to.equal(shippingDeadline);
            expect(_deliveryDeadline).to.equal(deliveryDeadline);
            // expect(_escrow)
            //     .to
            //     .equal(ethers.constants.AddressZero);
        });

        it('should get trade type', async () => {
            expect(await orderTradeContract.getTradeType()).to.equal(1);
        });

        it('should get who has signed the order', async () => {
            expect(await orderTradeContract.getWhoSigned()).to.deep.equal([ethers.constants.AddressZero, ethers.constants.AddressZero]);
            await orderTradeContract.connect(supplier).confirmOrder();
            expect(await orderTradeContract.getWhoSigned()).to.deep.equal([supplier.address, ethers.constants.AddressZero]);
            await orderTradeContract.connect(commissioner).confirmOrder();
            expect(await orderTradeContract.getWhoSigned()).to.deep.equal([supplier.address, commissioner.address]);
        });
    });

    describe('Updates', () => {
        it('should update the payment deadline', async () => {
            const newPaymentDeadline: number = 1000;
            const tx = await orderTradeContract.connect(supplier).updatePaymentDeadline(newPaymentDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , _paymentDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0]).to.equal(supplier.address);
            expect(_paymentDeadline).to.equal(newPaymentDeadline);
        });

        it('should update the document delivery deadline', async () => {
            const newDocumentDeliveryDeadline: number = 2000;
            const tx = await orderTradeContract.connect(commissioner).updateDocumentDeliveryDeadline(newDocumentDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , _documentDeliveryDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0]).to.equal(commissioner.address);
            expect(_documentDeliveryDeadline).to.equal(newDocumentDeliveryDeadline);
        });

        it('should update the arbiter', async () => {
            const newArbiter: string = Wallet.createRandom().address;
            const tx = await orderTradeContract.connect(commissioner).updateArbiter(newArbiter);
            const receipt = await tx.wait();
            const [, , , , , , , , , , _arbiter] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0]).to.equal(commissioner.address);
            expect(_arbiter).to.equal(newArbiter);
        });

        it('should update the shipping deadline', async () => {
            const newShippingDeadline: number = 4000;
            const tx = await orderTradeContract.connect(admin).updateShippingDeadline(newShippingDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , _shippingDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_shippingDeadline).to.equal(newShippingDeadline);
        });

        it('should update the delivery deadline', async () => {
            const newDeliveryDeadline: number = 5000;
            const tx = await orderTradeContract.connect(admin).updateDeliveryDeadline(newDeliveryDeadline);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , , _deliveryDeadline] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_deliveryDeadline).to.equal(newDeliveryDeadline);
        });

        it('should update the agreed amount', async () => {
            const newAgreedAmount: number = 2000;
            const tx = await orderTradeContract.connect(admin).updateAgreedAmount(newAgreedAmount);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , , , , _agreedAmount] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_agreedAmount).to.equal(newAgreedAmount);
        });

        it('should update the token address', async () => {
            const newTokenAddress = Wallet.createRandom().address;
            const tx = await orderTradeContract.connect(admin).updateTokenAddress(newTokenAddress);
            const receipt = await tx.wait();
            const [, , , , , , , , , , , , , , , _tokenAddress] = await orderTradeContract.getTrade();

            expect(receipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed')).to.be.undefined;
            expect(_tokenAddress).to.equal(newTokenAddress);
        });
    });

    describe('Order status', () => {
        before(async () => {
            await ethers.provider.send('evm_mine', [Date.now()]);
        });

        it('should compute the order status - CONTRACTING', async () => {
            expect(await orderTradeContract.connect(supplier).getOrderStatus()).to.equal(0);
        });

        it('should compute the order status - PRODUCTION', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            // order is now successfully negotiated
            expect(await orderTradeContract.getOrderStatus()).to.equal(1);
        });

        it('should compute the order status - PAYED', async () => {
            // add PAYMENT_INVOICE document
            await orderTradeContract.connect(supplier).addDocument(3, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            expect(await orderTradeContract.getOrderStatus()).to.equal(2);
        });

        it('should compute the order status - EXPORTED', async () => {
            // add ORIGIN_SWISS_DECODE document
            await orderTradeContract.connect(supplier).addDocument(4, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            // add WEIGHT_CERTIFICATE document
            await orderTradeContract.connect(supplier).addDocument(5, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            // add FUMIGATION_CERTIFICATE document
            await orderTradeContract.connect(supplier).addDocument(6, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            // add PREFERENTIAL_ENTRY_CERTIFICATE document
            await orderTradeContract.connect(supplier).addDocument(7, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            // add PHYTOSANITARY_CERTIFICATE document
            await orderTradeContract.connect(supplier).addDocument(8, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            // add INSURANCE_CERTIFICATE document
            await orderTradeContract.connect(supplier).addDocument(9, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);

            expect(await orderTradeContract.getOrderStatus()).to.equal(3);
        });

        // it('should compute the order status - EXPORTED (because BILL_OF_LADING not approved)', async () => {
        //     add BILL_OF_LADING document
        // await orderTradeContract.connect(supplier).addDocument(2, externalUrl, metadataHash);
        // await orderTradeContract.connect(commissioner).validateDocument(1, 2);
        // expect(await orderTradeContract.getOrderStatus()).to.equal(3);
        // });

        it('should compute the order status - SHIPPED', async () => {
            // add BILL_OF_LADING document
            await orderTradeContract.connect(supplier).addDocument(2, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            expect(await orderTradeContract.getOrderStatus()).to.equal(4);
        });

        it('should compute the order status - COMPLETED', async () => {
            // add COMPARISON_SWISS_DECODE document
            await orderTradeContract.connect(supplier).addDocument(10, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);
            expect(await orderTradeContract.getOrderStatus()).to.equal(5);
        });

        it('should complete the transaction', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();

            await orderTradeContract.connect(supplier).addDocument(10, externalUrl, metadataHash);
            await orderTradeContract.connect(commissioner).validateDocument(1, 1);

            await orderTradeContract.completeTransaction();
            expect(escrowFakeContract.enableWithdrawal).to.have.callCount(1);
        });
    });

    describe('Order lines', () => {
        it('should add, get and update an order line', async () => {
            const tx = await orderTradeContract.connect(supplier).addLine(1, 100, units[1], [10, 0, fiats[0]]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];
            expect(lineId).to.equal(1);

            const result = await orderTradeContract.getLine(lineId);
            expect(result[0]).to.deep.equal([lineId, 1, 100, units[1], 0, true]);
            expect(result[1]).to.deep.equal([[10, 0, fiats[0]]]);

            const updateTx = await orderTradeContract.connect(commissioner).updateLine(lineId, 2, 200, units[0], [20, 0, fiats[1]]);
            const updateReceipt = await updateTx.wait();
            expect(updateReceipt.events.find((event: Event) => event.event === 'OrderLineUpdated').args[0]).to.equal(lineId);

            const newResult = await orderTradeContract.getLine(lineId);
            expect(newResult[0]).to.deep.equal([lineId, 2, 200, units[0], 0, true]);
            expect(newResult[1]).to.deep.equal([[20, 0, fiats[1]]]);

            await orderTradeContract.connect(supplier).addLine(3, 30, units[0], [20, 2, fiats[0]]);

            const lineCounter = await orderTradeContract.getLineCounter();
            expect(lineCounter).to.equal(2);
        });

        it('should assign a material to an order line', async () => {
            const tx = await orderTradeContract.connect(supplier).addLine(1, 100, units[0], [10, 0, fiats[0]]);
            await tx.wait();

            const assignTx = await orderTradeContract.connect(supplier).assignMaterial(1, 1);
            const assignReceipt = await assignTx.wait();

            const line = await orderTradeContract.getLine(1);
            expect(line[0]).to.deep.equal([1, 1, 100, units[0], 1, true]);
            expect(line[1]).to.deep.equal([[10, 0, fiats[0]]]);
            expect(assignReceipt.events.find((event: Event) => event.event === 'MaterialAssigned').args[0]).to.equal(1);
        });

        it('should get an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.getLine(100)).to.be.revertedWith('Trade: Line does not exist');
        });

        it('should add an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();

            await expect(orderTradeContract.connect(admin).addLine(1, 100, units[1], [10, 0, fiats[0]])).to.be.revertedWith(
                'OrderTrade: The order has already been confirmed, therefore it cannot be changed'
            );
        });

        it('should add an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await expect(orderTradeContract.connect(admin).addLine(1, 100, units[0], [10, 0, 'nonExistingFiat'])).to.be.revertedWith(
                'OrderTrade: Fiat has not been registered'
            );
        });

        it('should update an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.connect(admin).updateLine(1, 1, 200, units[0], [20, 0, fiats[0]])).to.be.revertedWith(
                'Trade: Line does not exist'
            );
        });

        it('should update an order line - FAIL(OrderTrade: The order has already been confirmed, therefore it cannot be changed)', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();

            await expect(orderTradeContract.connect(admin).updateLine(1, 1, 200, units[0], [20, 0, fiats[0]])).to.be.revertedWith(
                'OrderTrade: The order has already been confirmed, therefore it cannot be changed'
            );
        });

        it('should update an order line - FAIL(OrderTrade: Fiat has not been registered)', async () => {
            await orderTradeContract.connect(admin).addLine(1, 100, units[0], [10, 0, fiats[0]]);
            await expect(orderTradeContract.connect(admin).updateLine(1, 1, 200, units[0], [20, 0, 'non existing fiat'])).to.be.revertedWith(
                'OrderTrade: Fiat has not been registered'
            );
        });

        it('should assign a material to an order line - FAIL(Trade: Line does not exist)', async () => {
            await expect(orderTradeContract.connect(supplier).assignMaterial(1, 1)).to.be.rejectedWith('Trade: Line does not exist');
        });
    });

    describe('Order confirmation', () => {
        it('should confirm an order', async () => {
            const supplierTx = await orderTradeContract.connect(supplier).confirmOrder();
            const supplierReceipt = await supplierTx.wait();
            const commissionerTx = await orderTradeContract.connect(commissioner).confirmOrder();
            const commissionerReceipt = await commissionerTx.wait();
            const [, , , , , , hasSupplierSigned, hasCommissionerSigned] = await orderTradeContract.getTrade();

            expect(supplierReceipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0]).to.equal(supplier.address);
            expect(supplierReceipt.events.find((event: Event) => event.event === 'OrderConfirmed')).to.be.undefined;
            expect(commissionerReceipt.events.find((event: Event) => event.event === 'OrderSignatureAffixed').args[0]).to.equal(commissioner.address);
            expect(commissionerReceipt.events.find((event: Event) => event.event === 'OrderConfirmed')).to.not.be.undefined;
            expect(hasSupplierSigned).to.equal(true);
            expect(hasCommissionerSigned).to.equal(true);
        });

        it('should remove confirmation when a constraint is updated by the other party', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            const [, , , , , , hasSupplierSigned] = await orderTradeContract.getTrade();
            expect(hasSupplierSigned).to.true;

            await orderTradeContract.connect(commissioner).updatePaymentDeadline(2000);
            const [, , , , , , updatedHasSupplierSigned] = await orderTradeContract.getTrade();
            expect(updatedHasSupplierSigned).to.false;
        });
    });

    describe('Negotiation status', () => {
        it('should get status INITIALIZED when no one has confirmed', async () => {
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(0);
        });

        it('should get status PENDING when only supplier has confirmed', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(1);
        });

        it('should get status PENDING when only commissioner has confirmed', async () => {
            await orderTradeContract.connect(commissioner).confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(1);
        });

        it('should get status CONFIRMED when both supplier and commissioner have confirmed', async () => {
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(2);
        });
    });

    describe('Order expiration', () => {
        it('should return whether a deadline has passed', async () => {
            // await _createOrderTrade(Date.now() + 1000000);
            expect(await orderTradeContract.connect(supplier).haveDeadlinesExpired()).to.equal(false);

            await orderTradeContract.connect(supplier).updateDocumentDeliveryDeadline(100);
            await orderTradeContract.connect(commissioner).confirmOrder();
            expect(await orderTradeContract.connect(supplier).haveDeadlinesExpired()).to.equal(true);
        });

        it('should change escrow status when enforcing deadlines on an order with expired deadlines', async () => {
            await orderTradeContract.connect(supplier).updateDocumentDeliveryDeadline(100);

            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(2);
            expect(escrowFakeContract.enableRefund).to.have.callCount(1);
        });

        it('should not change escrow status when enforcing deadlines on an order with unexpired deadlines', async () => {
            const now = Date.now();
            await _createOrderTrade(now + 1);
            await orderTradeContract.connect(supplier).confirmOrder();
            await orderTradeContract.connect(commissioner).confirmOrder();
            await ethers.provider.send('evm_mine', [now + 2]);
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(2);
        });

        it('should not change escrow status when enforcing deadlines on non-confirmed escrow', async () => {
            await orderTradeContract.enforceDeadlines();
            expect(await orderTradeContract.getNegotiationStatus()).to.equal(0);
        });
    });
});
