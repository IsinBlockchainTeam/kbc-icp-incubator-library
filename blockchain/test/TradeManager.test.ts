/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import chai, { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

chai.use(smock.matchers);

let tradeManagerContract: Contract;
let enumerableFiatManagerContractFake: FakeContract;
let enumerableProductCategoryManagerContractFake: FakeContract;
let documentManagerContractFake: FakeContract;
let enumerableDocumentTypeManagerContractFake: FakeContract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let supplier: SignerWithAddress;
let customer: SignerWithAddress;
let otherAccount: SignerWithAddress;
let tradeCounterId: BigNumber;

const _addAllOrderConstraints = async (senderSigner: SignerWithAddress, supplierAddress: string, orderId: number) => {
    await tradeManagerContract.connect(senderSigner).setOrderPaymentDeadline(supplierAddress, orderId, new Date().getTime());
    await tradeManagerContract.connect(senderSigner).setOrderDocumentDeliveryDeadline(supplierAddress, orderId, new Date().getTime());
    await tradeManagerContract.connect(senderSigner).setOrderArbiter(supplierAddress, orderId, 'arbiter');
    await tradeManagerContract.connect(senderSigner).setOrderShippingDeadline(supplierAddress, orderId, new Date().getTime());
    await tradeManagerContract.connect(senderSigner).setOrderDeliveryDeadline(supplierAddress, orderId, new Date().getTime());
};

describe('TradeManager', () => {
    const basicTrade = {
        name: 'trade 1',
        externalUrl: 'https://testurl.ch/ipfs',
    };
    const basicTradeLineMaterialIds = [1, 2];
    const categories = ['categoryA', 'categoryB'];
    const fiats = ['CHF'];
    const documentTypes = ['documentType1'];

    before(async () => {
        [owner, admin, supplier, customer, otherAccount] = await ethers.getSigners();

        const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
        enumerableFiatManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableProductCategoryManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableDocumentTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);

        enumerableFiatManagerContractFake.contains.returns((value: string) => fiats.includes(value[0]));
        enumerableProductCategoryManagerContractFake.contains.returns((value: string) => categories.includes(value[0]));
        enumerableDocumentTypeManagerContractFake.contains.returns((value: string) => documentTypes.includes(value[0]));

        tradeManagerContract = await TradeManager.deploy([admin.address], enumerableFiatManagerContractFake.address,
            enumerableProductCategoryManagerContractFake.address, documentManagerContractFake.address);

        await tradeManagerContract.deployed();
    });

    describe('registerTrade', () => {
        it('should register and retrieve a basic trade', async () => {
            await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
            await tradeManagerContract.connect(supplier).addTradeName(supplier.address, tradeCounterId.toNumber(), basicTrade.name);

            const trade = await tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, tradeCounterId.toNumber());
            expect(trade.id).to.equal(tradeCounterId.toNumber());
            expect(trade.supplier).to.equal(supplier.address);
            expect(trade.customer).to.equal(customer.address);
            expect(trade.name).to.equal(basicTrade.name);
            expect(trade.externalUrl).to.equal(basicTrade.externalUrl);
        });

        it('should register a trade - FAIL (sender is neither supplier nor customer)', async () => {
            await expect(tradeManagerContract.connect(otherAccount).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl)).to.be.revertedWith('Sender is neither supplier nor customer');
        });

        it('should try to retrieve a trade - FAIL(Trade does not exist)', async () => {
            await expect(tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, 50)).to.be.revertedWith('Trade does not exist');
        });

        it('should try to retrieve a trade - FAIL(Can\'t perform this operation if not TRADE)', async () => {
            await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

            await expect(tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, tradeCounterId.toNumber())).to.be.revertedWith('Can\'t perform this operation if not TRADE');
        });

        it('should emit TradeRegistered event', async () => {
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
            await expect(tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl))
                .to.emit(tradeManagerContract, 'TradeRegistered')
                .withArgs(tradeCounterId.toNumber() + 1, supplier.address);
        });

        it('should check if trade exists', async () => {
            await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
            const exist = await tradeManagerContract.connect(supplier).tradeExists(supplier.address, tradeCounterId.toNumber());
            expect(exist).to.be.true;
        });
    });

    describe('manipulate trade by adding/updating lines', () => {
        let tradeLineCounterId: BigNumber;
        const initialProductCategory = categories[0];

        before(async () => {
            await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
        });

        describe('addTradeLine', () => {
            it('should add a trade line', async () => {
                await tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory);

                expect(enumerableProductCategoryManagerContractFake.contains).to.be.called;
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.calledWith(initialProductCategory);
            });

            it('should emit TradeLineAdded event', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                const { lineIds } = await tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, tradeCounterId.toNumber());
                tradeLineCounterId = lineIds.slice(-1)[0];

                await expect(tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory))
                    .to.emit(tradeManagerContract, 'TradeLineAdded')
                    .withArgs(tradeCounterId.toNumber(), supplier.address, tradeLineCounterId.toNumber() + 1);
            });

            it('should add a trade line - FAIL (Trade does not exist)', async () => {
                const otherTradeId = 50;
                await expect(tradeManagerContract.connect(supplier).addTradeLine(supplier.address, otherTradeId, basicTradeLineMaterialIds, initialProductCategory)).to.be.revertedWith('Trade does not exist');
            });

            it('should add a trade line - FAIL (The product category specified isn\'t registered)', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await expect(tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, 'custom product category')).to.be.revertedWith("The product category specified isn't registered");
            });

            it('should add a trade line - FAIL (Can\'t perform this operation if not TRADE)', async () => {
                await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await expect(tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory)).to.be.revertedWith('Can\'t perform this operation if not TRADE');
            });
        });

        describe('getTradeLine', () => {
            before(async () => {
                await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory);
                const { lineIds } = await tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, tradeCounterId.toNumber());
                tradeLineCounterId = lineIds.slice(-1)[0];
            });

            it('should get a trade line', async () => {
                const tL = await tradeManagerContract.connect(supplier).getTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber());
                expect(tL.id.toNumber()).to.equal(tradeLineCounterId.toNumber());
                expect(tL.productCategory.toString()).to.equal(initialProductCategory);
                expect(tL.quantity.toNumber()).to.equal(0);
                expect(tL.price.amount).to.be.equal(0);
                expect(tL.price.decimals).to.be.equal(0);
                expect(tL.price.fiat).to.be.empty;
            });

            it('should get a trade line - FAIL (Trade does not exist)', async () => {
                const otherTradeId = 50;
                await expect(tradeManagerContract.connect(supplier).getTradeLine(supplier.address, otherTradeId, tradeLineCounterId.toNumber())).to.be.revertedWith('Trade does not exist');
            });

            it('should get a trade line - FAIL (Trade does not exist)', async () => {
                const otherTradeLineId = 50;
                await expect(tradeManagerContract.connect(supplier).getTradeLine(supplier.address, tradeCounterId.toNumber(), otherTradeLineId)).to.be.revertedWith('Trade line does not exist');
            });

            it('should get a trade line - FAIL (Only a TRADE has trade lines)', async () => {
                await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await expect(tradeManagerContract.connect(supplier).getTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber())).to.be.revertedWith('Only a TRADE has trade lines');
            });
        });

        describe('updateTradeLine', () => {
            const updatedMaterialIds = [4, 5];
            const updatedProductCategory = categories[1];

            before(async () => {
                await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await tradeManagerContract.connect(supplier).addTradeLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory);
                const { lineIds } = await tradeManagerContract.connect(supplier).getTradeInfo(supplier.address, tradeCounterId.toNumber());
                tradeLineCounterId = lineIds.slice(-1)[0];
            });

            it('should update a trade line', async () => {
                await tradeManagerContract.connect(supplier).updateTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber(), updatedMaterialIds, updatedProductCategory);

                expect(enumerableProductCategoryManagerContractFake.contains).to.be.called;
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.calledWith(updatedProductCategory);

                const savedTradeLine = await tradeManagerContract.connect(supplier).getTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber());
                expect(savedTradeLine.id).to.equal(tradeLineCounterId);
                expect(savedTradeLine.materialIds).to.not.equal(basicTradeLineMaterialIds);
                expect(savedTradeLine.materialIds.map((m: BigNumber) => m.toNumber())).to.eql(updatedMaterialIds);
                expect(savedTradeLine.productCategory.toString()).to.not.equal(initialProductCategory);
                expect(savedTradeLine.productCategory.toString()).to.equal(updatedProductCategory);
                expect(savedTradeLine.quantity).to.be.equal(0);
                expect(savedTradeLine.price.amount).to.be.equal(0);
                expect(savedTradeLine.price.decimals).to.be.equal(0);
                expect(savedTradeLine.price.fiat).to.be.empty;
            });

            it('should emit TradeLineUpdated event', async () => {
                await expect(tradeManagerContract.connect(supplier).updateTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber(), updatedMaterialIds, updatedProductCategory))
                    .to.emit(tradeManagerContract, 'TradeLineUpdated')
                    .withArgs(tradeCounterId.toNumber(), supplier.address, tradeLineCounterId.toNumber());
            });

            it('should update a trade line - FAIL (Trade does not exist)', async () => {
                const otherTradeId = 50;
                await expect(tradeManagerContract.connect(supplier).updateTradeLine(supplier.address, otherTradeId, tradeLineCounterId.toNumber(), updatedMaterialIds, updatedProductCategory)).to.be.revertedWith('Trade does not exist');
            });

            it('should add a trade line - FAIL (The product category specified isn\'t registered)', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await expect(tradeManagerContract.connect(supplier).updateTradeLine(supplier.address, tradeCounterId.toNumber(), tradeLineCounterId.toNumber(), basicTradeLineMaterialIds, 'custom product category')).to.be.revertedWith("The product category specified isn't registered");
            });
        });
    });

    describe('confirmOrder', () => {
        before(async () => {
            await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

            await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);
        });

        it('should confirm an order - FAIL (Cannot confirm an order if all constraints have not been defined', async () => {
            await expect(tradeManagerContract.connect(supplier).setOrderPaymentDeadline(supplier.address, tradeCounterId, new Date().getTime()));
            await expect(tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId)).to.be.revertedWith('Cannot confirm an order if all constraints have not been defined');
        });

        it('should confirm an order', async () => {
            await _addAllOrderConstraints(supplier, supplier.address, tradeCounterId.toNumber());
            await tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId);
            await tradeManagerContract.connect(customer).confirmOrder(supplier.address, tradeCounterId);
            const negotiationStatus = await tradeManagerContract.connect(supplier).getNegotiationStatus(supplier.address, tradeCounterId);
            expect(negotiationStatus).to.be.equal(2);
        });

        it('should confirm an order - FAIL (Only an offeree or an offeror can confirm the order)', async () => {
            await expect(tradeManagerContract.connect(otherAccount).confirmOrder(supplier.address, tradeCounterId)).to.be.revertedWith('Only an offeree or an offeror can confirm the order');
        });
    });

    describe('addDocument', () => {
        before(async () => {
            await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

            await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);
            await _addAllOrderConstraints(supplier, supplier.address, tradeCounterId.toNumber());
        });

        it('should add a document to an existing order - FAIL (The order is not already confirmed, cannot add document)', async () => {
            await expect(tradeManagerContract.connect(supplier).addDocument(supplier.address, tradeCounterId, 'document name', documentTypes[0], 'external_doc_url'))
                .to.be.revertedWith('The order is not already confirmed, cannot add document');
        });

        it('should add a document to an existing order', async () => {
            await tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId);
            await tradeManagerContract.connect(customer).confirmOrder(supplier.address, tradeCounterId);
            await tradeManagerContract.connect(supplier).addDocument(supplier.address, tradeCounterId, 'document name', documentTypes[0], 'external_doc_url');
            expect(documentManagerContractFake.registerDocument).to.have.callCount(1);
            expect(documentManagerContractFake.registerDocument).to.have.calledWith(supplier.address, tradeCounterId, 'document name', documentTypes[0], 'external_doc_url');
        });

        it('should add a document to an existing order - FAIL (Trade does not exist)', async () => {
            await tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId);
            await tradeManagerContract.connect(customer).confirmOrder(supplier.address, tradeCounterId);
            await expect(tradeManagerContract.connect(supplier).addDocument(supplier.address, 50, 'document name', documentTypes[0], 'external_doc_url'))
                .to.be.revertedWith('Trade does not exist');
        });
    });

    describe('manipulate order by adding/updating lines', () => {
        let orderLineCounterId: BigNumber;
        const initialProductCategory = categories[0];
        const quantity = BigNumber.from(10);
        const price = {
            amount: BigNumber.from(100),
            decimals: BigNumber.from(2),
            fiat: fiats[0],
        };

        before(async () => {
            await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
            await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);

            await _addAllOrderConstraints(supplier, supplier.address, tradeCounterId.toNumber());
        });

        describe('addOrderLine', () => {
            it('should add and retrieve an order line', async () => {
                await tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price);

                expect(enumerableFiatManagerContractFake.contains).to.be.called;
                expect(enumerableFiatManagerContractFake.contains).to.be.calledWith(price.fiat);
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.called;
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.calledWith(initialProductCategory);

                const { lineIds } = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                const savedOrderLine = await tradeManagerContract.connect(supplier).getOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(savedOrderLine.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(savedOrderLine.productCategory.toString()).to.equal(initialProductCategory);
                expect(savedOrderLine.quantity.toNumber()).to.equal(quantity.toNumber());
                expect(savedOrderLine.price.fiat).to.equal(price.fiat);
                expect(savedOrderLine.price.amount.toNumber()).to.equal(price.amount);
                expect(savedOrderLine.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should emit OrderLineAdded event', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                const { lineIds } = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                await expect(tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price))
                    .to.emit(tradeManagerContract, 'OrderLineAdded')
                    .withArgs(tradeCounterId.toNumber(), supplier.address, orderLineCounterId.toNumber() + 1);
            });

            it('should add a order line - FAIL (Order does not exist)', async () => {
                const otherOrderId = 50;
                await expect(tradeManagerContract.connect(supplier).addOrderLine(supplier.address, otherOrderId, basicTradeLineMaterialIds, initialProductCategory, quantity, price)).to.be.revertedWith('Order does not exist');
            });

            it('should add a order line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(tradeManagerContract.connect(otherAccount).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should add a order line - FAIL (The fiat of the order line isn\'t registered)', async () => {
                const oldFiat = price.fiat;
                price.fiat = 'FIAT';
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await expect(tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price)).to.be.revertedWith("The fiat of the order line isn't registered");
                price.fiat = oldFiat;
            });

            it('should add a order line - FAIL (The product category specified isn\'t registered)', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await expect(tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, 'custom product category', quantity, price)).to.be.revertedWith("The product category specified isn't registered");
            });

            it('should add a order line - FAIL (The order has been confirmed, it cannot be changed)', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId);
                tradeManagerContract.connect(customer).confirmOrder(supplier.address, tradeCounterId);

                await expect(tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price)).to.be.revertedWith('The order has been confirmed, it cannot be changed');
            });
        });

        describe('getOrderLine', () => {
            before(async () => {
                await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);

                await tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price);
                const { lineIds } = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];
            });

            it('should get an order line', async () => {
                const cl = await tradeManagerContract.connect(supplier).getOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(cl.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(cl.productCategory.toString()).to.equal(initialProductCategory);
                expect(cl.quantity.toNumber()).to.equal(quantity.toNumber());
                expect(cl.price.fiat).to.equal(price.fiat);
                expect(cl.price.amount.toNumber()).to.equal(price.amount);
                expect(cl.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should get an order line - FAIL (Trade does not exist)', async () => {
                const otherOrderId = 50;
                await expect(tradeManagerContract.connect(supplier).getOrderLine(supplier.address, otherOrderId, orderLineCounterId.toNumber())).to.be.revertedWith('Order does not exist');
            });

            it('should get an order line - FAIL (Trade does not exist)', async () => {
                const otherOrderLineId = 50;
                await expect(tradeManagerContract.connect(supplier).getOrderLine(supplier.address, tradeCounterId.toNumber(), otherOrderLineId)).to.be.revertedWith('Order line does not exist');
            });

            it('should get an order line - FAIL (Only an ORDER has order lines)', async () => {
                await tradeManagerContract.connect(supplier).registerTrade(0, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await expect(tradeManagerContract.connect(supplier).getOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber())).to.be.revertedWith('Only an ORDER has order lines');
            });
        });

        describe('tradeLineExists', () => {
            it('should check if a trade line exists', async () => {
                await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);

                await tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price);
                const { lineIds } = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];

                const exist = await tradeManagerContract.connect(supplier).tradeLineExists(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(exist).to.be.true;
            });
        });

        describe('updateOrderLine', () => {
            // ...orderLine non effettua una deep copy dei nested object (price)
            //     const updatedOrderLine = { ...orderLine, productCategory: 'categoryUpdated' };
            const updatedProductCategory = categories[1];

            before(async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId.toNumber(), basicTradeLineMaterialIds, initialProductCategory, quantity, price);
                const { lineIds } = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                orderLineCounterId = lineIds.slice(-1)[0];
            });

            it('should update an order line', async () => {
                await tradeManagerContract.connect(supplier).updateOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber(), basicTradeLineMaterialIds, updatedProductCategory, quantity, price);

                expect(enumerableFiatManagerContractFake.contains).to.be.called;
                expect(enumerableFiatManagerContractFake.contains).to.be.calledWith(price.fiat);
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.called;
                expect(enumerableProductCategoryManagerContractFake.contains).to.be.calledWith(updatedProductCategory);
                const savedOrderLine = await tradeManagerContract.connect(supplier).getOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber());
                expect(savedOrderLine.id.toNumber()).to.equal(orderLineCounterId.toNumber());
                expect(savedOrderLine.productCategory.toString()).to.not.equal(initialProductCategory);
                expect(savedOrderLine.productCategory.toString()).to.equal(updatedProductCategory);
            });

            it('should emit OrderLineUpdated event', async () => {
                await expect(tradeManagerContract.connect(supplier).updateOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber(), basicTradeLineMaterialIds, updatedProductCategory, quantity, price))
                    .to.emit(tradeManagerContract, 'OrderLineUpdated')
                    .withArgs(tradeCounterId.toNumber(), supplier.address, orderLineCounterId.toNumber());
            });

            it('should update a order line - FAIL (Order does not exist)', async () => {
                const otherOrderId = 50;
                await expect(tradeManagerContract.connect(supplier).updateOrderLine(supplier.address, otherOrderId, orderLineCounterId.toNumber(), basicTradeLineMaterialIds, updatedProductCategory, quantity, price)).to.be.revertedWith('Order does not exist');
            });

            it('should update a order line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(tradeManagerContract.connect(otherAccount).updateOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber(), basicTradeLineMaterialIds, updatedProductCategory, quantity, price)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should update a order line - FAIL (The fiat of the order line isn\'t registered)', async () => {
                const oldFiat = price.fiat;
                price.fiat = 'FIAT';
                await expect(tradeManagerContract.connect(supplier).updateOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber(), basicTradeLineMaterialIds, updatedProductCategory, quantity, price)).to.be.revertedWith("The fiat of the order line isn't registered");
                price.fiat = oldFiat;
            });

            it('should update a order line - FAIL (The product category specified isn\'t registered)', async () => {
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
                await expect(tradeManagerContract.connect(supplier).updateOrderLine(supplier.address, tradeCounterId.toNumber(), orderLineCounterId.toNumber(), basicTradeLineMaterialIds, 'custom product category', quantity, price)).to.be.revertedWith("The product category specified isn't registered");
            });
        });

        describe('getNegotiationStatus', () => {
            let orderStatus;

            before(async () => {
                await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
                tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);

                await tradeManagerContract.connect(supplier).addOrderOfferee(supplier.address, tradeCounterId.toNumber(), customer.address);
            });

            describe('Order initialization', () => {
                it('should try to get order status - FAIL (Order does not exist)', async () => {
                    await expect(tradeManagerContract.connect(supplier).getNegotiationStatus(supplier.address, 50)).to.be.revertedWith('Order does not exist');
                });

                it('neither supplier nor customer have been signed the order, result = INITIALIZED', async () => {
                    orderStatus = await tradeManagerContract.connect(supplier).getNegotiationStatus(supplier.address, tradeCounterId.toNumber());
                    expect(orderStatus).to.equal(0);
                });
            });

            describe('Negotiation status with defined constraints', () => {
                before(async () => {
                    await _addAllOrderConstraints(supplier, supplier.address, tradeCounterId.toNumber());
                });

                it('the supplier should change the order negotiation status by adding line, result = PENDING', async () => {
                    await tradeManagerContract.connect(supplier).addOrderLine(supplier.address, tradeCounterId, basicTradeLineMaterialIds, initialProductCategory, quantity, price);
                    orderStatus = await tradeManagerContract.connect(supplier).getNegotiationStatus(supplier.address, tradeCounterId.toNumber());
                    expect(orderStatus).to.equal(1);
                });

                it('the customer should change again the order negotiation status by adding a line, result = PENDING', async () => {
                    await tradeManagerContract.connect(customer).addOrderLine(supplier.address, tradeCounterId, basicTradeLineMaterialIds, initialProductCategory, quantity, price);
                    orderStatus = await tradeManagerContract.connect(customer).getNegotiationStatus(supplier.address, tradeCounterId.toNumber());
                    expect(orderStatus).to.equal(1);
                });

                it('the supplier should confirm the order, result = COMPLETED', async () => {
                    await tradeManagerContract.connect(supplier).confirmOrder(supplier.address, tradeCounterId);
                    orderStatus = await tradeManagerContract.connect(supplier).getNegotiationStatus(supplier.address, tradeCounterId.toNumber());
                    expect(orderStatus).to.equal(2);
                });
            });
        });
    });

    describe('manipulate order by setting constraints', () => {
        before(async () => {
            await tradeManagerContract.connect(supplier).registerTrade(1, supplier.address, customer.address, basicTrade.externalUrl);
            tradeCounterId = await tradeManagerContract.connect(supplier).getTradeCounter(supplier.address);
        });

        describe('setOrderPaymentDeadline', () => {
            const deadline = new Date('2030-10-10').getTime();

            it('should set the payment deadline', async () => {
                await tradeManagerContract.connect(supplier).setOrderPaymentDeadline(supplier.address, tradeCounterId, deadline);
                const order = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                expect(order.paymentDeadline).to.equal(deadline);
            });

            it('should set the payment deadline - FAIL(Order does not exist)', async () => {
                await expect(tradeManagerContract.connect(supplier).setOrderPaymentDeadline(supplier.address, 50, deadline)).to.be.revertedWith('Order does not exist');
            });
        });

        describe('setOrderDocumentDeliveryDeadline', () => {
            const deadline = new Date('2030-10-10').getTime();

            it('should set the document delivery deadline', async () => {
                await tradeManagerContract.connect(supplier).setOrderDocumentDeliveryDeadline(supplier.address, tradeCounterId, deadline);
                const order = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                expect(order.documentDeliveryDeadline).to.equal(deadline);
            });

            it('should set the document delivery deadline - FAIL(Order does not exist)', async () => {
                await expect(tradeManagerContract.connect(supplier).setOrderDocumentDeliveryDeadline(supplier.address, 50, deadline)).to.be.revertedWith('Order does not exist');
            });
        });

        describe('setOrderArbiter', () => {
            const arbiter = 'arbiter 1';

            it('should set the arbiter', async () => {
                await tradeManagerContract.connect(supplier).setOrderArbiter(supplier.address, tradeCounterId, arbiter);
                const order = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                expect(order.arbiter).to.equal(arbiter);
            });

            it('should set the arbiter - FAIL(Order does not exist)', async () => {
                await expect(tradeManagerContract.connect(supplier).setOrderArbiter(supplier.address, 50, arbiter)).to.be.revertedWith('Order does not exist');
            });
        });

        describe('setOrderShippingDeadline', () => {
            const shippingDeadline = new Date('2030-10-10').getTime();

            it('should set the shipping deadline', async () => {
                await tradeManagerContract.connect(supplier).setOrderShippingDeadline(supplier.address, tradeCounterId, shippingDeadline);
                const order = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                expect(order.shippingDeadline).to.equal(shippingDeadline);
            });

            it('should set the shipping deadline - FAIL(Order does not exist)', async () => {
                await expect(tradeManagerContract.connect(supplier).setOrderShippingDeadline(supplier.address, 50, shippingDeadline)).to.be.revertedWith('Order does not exist');
            });
        });

        describe('setOrderDeliveryDeadline', () => {
            const deliveryDeadline = new Date('2030-10-10').getTime();

            it('should set the shipping deadline', async () => {
                await tradeManagerContract.connect(supplier).setOrderDeliveryDeadline(supplier.address, tradeCounterId, deliveryDeadline);
                const order = await tradeManagerContract.connect(supplier).getOrderInfo(supplier.address, tradeCounterId.toNumber());
                expect(order.deliveryDeadline).to.equal(deliveryDeadline);
            });

            it('should set the shipping deadline - FAIL(Order does not exist)', async () => {
                await expect(tradeManagerContract.connect(supplier).setOrderDeliveryDeadline(supplier.address, 50, deliveryDeadline)).to.be.revertedWith('Order does not exist');
            });
        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check that the sender is supplier or customer', async () => {
            const isParty = await tradeManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, tradeCounterId, customer.address);
            expect(isParty).to.be.true;
        });

        it('should check that the sender is supplier or customer', async () => {
            const isParty = await tradeManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, tradeCounterId, otherAccount.address);
            expect(isParty).to.be.false;
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await tradeManagerContract.connect(owner).addAdmin(admin.address);
            expect(await tradeManagerContract.hasRole(await tradeManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await tradeManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await tradeManagerContract.hasRole(await tradeManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(tradeManagerContract.connect(supplier).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(tradeManagerContract.connect(supplier).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
