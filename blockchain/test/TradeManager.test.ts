/* eslint-disable import/no-extraneous-dependencies */
import { Contract, Wallet, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { Trade } from '../typechain-types';

describe('TradeManager.sol', () => {
    let tradeManagerContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress,
        customer: SignerWithAddress, commissioner: SignerWithAddress,
        arbiter: SignerWithAddress;
    const productCategoryManagerContractAddress: string = Wallet.createRandom().address;
    const materialManagerContractAddress: string = Wallet.createRandom().address;
    const documentManagerAddress: string = Wallet.createRandom().address;
    const fiatManagerAddress: string = Wallet.createRandom().address;

    const externalUrl: string = 'https://test.com';
    const name: string = 'Test basic trade';
    const paymentDeadline: number = Date.now() + 200000;
    const documentDeliveryDeadline: number = 200;
    const shippingDeadline: number = 300;
    const deliveryDeadline: number = 400;
    const agreedAmount: number = 1000;
    const tokenAddress: string = Wallet.createRandom().address;

    let escrowManagerContract: Contract;

    const _getTradeContract = async (id: number): Promise<Trade> => {
        const tradeAddress = await tradeManagerContract.getTrade(id);
        const tradeType = await tradeManagerContract.getTradeType(id);
        switch (tradeType) {
        case 0:
            return ethers.getContractAt(ContractName.BASIC_TRADE, tradeAddress);
        case 1:
            return ethers.getContractAt(ContractName.ORDER_TRADE, tradeAddress);
        default:
            throw new Error(`TradeManagerTest: an invalid value "${tradeType}" for "TradeType" was returned by the contract`);
        }
    };

    before(async () => {
        [admin, supplier, customer, commissioner, arbiter] = await ethers.getSigners();
        const EscrowManager = await ethers.getContractFactory(ContractName.ESCROW_MANAGER);
        escrowManagerContract = await EscrowManager.deploy(Wallet.createRandom().address, 10, 1);
        await escrowManagerContract.deployed();
    });

    beforeEach(async () => {
        const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
        tradeManagerContract = await TradeManager.deploy(productCategoryManagerContractAddress, materialManagerContractAddress, documentManagerAddress, fiatManagerAddress, escrowManagerContract.address);
        await tradeManagerContract.deployed();
    });

    describe('TradeManager creation', () => {
        it('should create a TradeManager - FAIL(TradeManager: product category manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(TradeManager.deploy(ethers.constants.AddressZero, materialManagerContractAddress, documentManagerAddress, fiatManagerAddress, escrowManagerContract.address))
                .to
                .be
                .revertedWith('TradeManager: product category manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: material manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(TradeManager.deploy(productCategoryManagerContractAddress, ethers.constants.AddressZero, documentManagerAddress, fiatManagerAddress, escrowManagerContract.address))
                .to
                .be
                .revertedWith('TradeManager: material manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: document category manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(TradeManager.deploy(productCategoryManagerContractAddress, materialManagerContractAddress, ethers.constants.AddressZero, fiatManagerAddress, escrowManagerContract.address))
                .to
                .be
                .revertedWith('TradeManager: document category manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: fiat manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(TradeManager.deploy(productCategoryManagerContractAddress, materialManagerContractAddress, documentManagerAddress, ethers.constants.AddressZero, escrowManagerContract.address))
                .to
                .be
                .revertedWith('TradeManager: fiat manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: escrow manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(TradeManager.deploy(productCategoryManagerContractAddress, materialManagerContractAddress, documentManagerAddress, fiatManagerAddress, ethers.constants.AddressZero))
                .to
                .be
                .revertedWith('TradeManager: escrow manager address is the zero address');
        });
    });

    describe('Basic trades registration', () => {
        it('should register a basic trade and retrieve it', async () => {
            const tx = await tradeManagerContract.registerBasicTrade(supplier.address, customer.address, commissioner.address, externalUrl, name);
            const receipt = await tx.wait();
            const eventArgs = receipt.events.find((event: Event) => event.event === 'BasicTradeRegistered').args;
            const id = eventArgs[0];

            expect(id)
                .to
                .equal(1);
            expect(eventArgs[1])
                .to
                .equal(supplier.address);
            expect(eventArgs[2])
                .to
                .equal(customer.address);
            expect(eventArgs[3])
                .to
                .equal(commissioner.address);

            const basicTradeAddress = await tradeManagerContract.getTrade(id);
            const basicTradeContract = await ethers.getContractAt('BasicTrade', basicTradeAddress);

            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _name] = await basicTradeContract.getTrade();
            expect(_tradeId)
                .to
                .equal(id);
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
            expect(_linesId.length)
                .to
                .equal(0);
            expect(_name)
                .to
                .equal(name);
        });

        it('should register a basic trade - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(tradeManagerContract.registerBasicTrade(ethers.constants.AddressZero, customer.address, commissioner.address, externalUrl, name))
                .to
                .be
                .revertedWith('TradeManager: supplier is the zero address');
        });

        it('should register a basic trade - FAIL(TradeManager: customer is the zero address)', async () => {
            await expect(tradeManagerContract.registerBasicTrade(supplier.address, ethers.constants.AddressZero, commissioner.address, externalUrl, name))
                .to
                .be
                .revertedWith('TradeManager: customer is the zero address');
        });

        it('should register a basic trade - FAIL(TradeManager: commissioner is the zero address)', async () => {
            await expect(tradeManagerContract.registerBasicTrade(supplier.address, customer.address, ethers.constants.AddressZero, externalUrl, name))
                .to
                .be
                .revertedWith('TradeManager: commissioner is the zero address');
        });
    });

    describe('Order trades registration', async () => {
        it('should register an order trade and retrieve it', async () => {
            const tx = await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            const receipt = await tx.wait();
            const eventArgs = receipt.events.find((event: Event) => event.event === 'OrderTradeRegistered').args;
            const id = eventArgs[0];

            expect(id)
                .to
                .equal(1);
            expect(eventArgs[1])
                .to
                .equal(supplier.address);
            expect(eventArgs[2])
                .to
                .equal(customer.address);
            expect(eventArgs[3])
                .to
                .equal(commissioner.address);

            const orderTradeAddress = await tradeManagerContract.getTrade(id);
            const orderTradeContract = await ethers.getContractAt(ContractName.ORDER_TRADE, orderTradeAddress);

            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, _escrow] = await orderTradeContract.getTrade();
            expect(_tradeId)
                .to
                .equal(id);
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
            expect(_linesId.length)
                .to
                .equal(0);
            expect(_hasSupplierSigned).to.equal(false);
            expect(_hasCommissionerSigned).to.equal(false);
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
            expect(_escrow).to.not.be.undefined;
            expect(_escrow)
                .to
                .not
                .equal(ethers.constants.AddressZero);
        });

        it('should register an order trade - - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(tradeManagerContract.registerOrderTrade(ethers.constants.AddressZero, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
                .to
                .be
                .revertedWith('TradeManager: supplier is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: customer is the zero address)', async () => {
            await expect(tradeManagerContract.registerOrderTrade(supplier.address, ethers.constants.AddressZero, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
                .to
                .be
                .revertedWith('TradeManager: customer is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(tradeManagerContract.registerOrderTrade(supplier.address, customer.address, ethers.constants.AddressZero, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
                .to
                .be
                .revertedWith('TradeManager: commissioner is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: arbiter is the zero address)', async () => {
            await expect(tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, ethers.constants.AddressZero, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
                .to
                .be
                .revertedWith('TradeManager: arbiter is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: payment deadline must be in the future)', async () => {
            await expect(tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, 0, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
                .to
                .be
                .revertedWith('TradeManager: payment deadline must be in the future');
        });
    });

    describe('Getters', () => {
        it('should get all trades', async () => {
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(Wallet.createRandom().address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, admin.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

            expect(await tradeManagerContract.getTradeCounter()).to.equal(3);

            const firstTrade = await _getTradeContract(1);
            expect(firstTrade.address).to.equal(await tradeManagerContract.getTrade(1));

            const secondTrade = await _getTradeContract(2);
            expect(secondTrade.address).to.equal(await tradeManagerContract.getTrade(2));

            const thirdTrade = await _getTradeContract(3);
            expect(thirdTrade.address).to.equal(await tradeManagerContract.getTrade(3));
        });

        it('should get all trades and types', async () => {
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerBasicTrade(Wallet.createRandom().address, customer.address, commissioner.address, externalUrl, 'test');
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, admin.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

            expect(await tradeManagerContract.getTradeCounter()).to.equal(3);

            const firstTrade = await _getTradeContract(1);
            expect(await firstTrade.getTradeType()).to.equal(await tradeManagerContract.getTradeType(1));

            const secondTrade = await _getTradeContract(2);
            expect(await secondTrade.getTradeType()).to.equal(await tradeManagerContract.getTradeType(2));

            const thirdTrade = await _getTradeContract(3);
            expect(await thirdTrade.getTradeType()).to.equal(await tradeManagerContract.getTradeType(3));
        });

        it('should get trade IDs of supplier', async () => {
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(Wallet.createRandom().address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, admin.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

            const supplierIds = await tradeManagerContract.getTradeIdsOfSupplier(supplier.address);
            const adminIds = await tradeManagerContract.getTradeIdsOfSupplier(admin.address);

            expect(supplierIds.length)
                .to
                .equal(2);
            expect(supplierIds[0])
                .to
                .equal(1);
            expect(supplierIds[1])
                .to
                .equal(3);
            expect(adminIds.length)
                .to
                .equal(0);
        });

        it('should get trade IDs of commissioner', async () => {
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(Wallet.createRandom().address, customer.address, commissioner.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            await tradeManagerContract.registerOrderTrade(supplier.address, customer.address, admin.address, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter.address, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

            const commissionerIds = await tradeManagerContract.getTradeIdsOfCommissioner(commissioner.address);
            const adminIds = await tradeManagerContract.getTradeIdsOfCommissioner(admin.address);
            const customerIds = await tradeManagerContract.getTradeIdsOfCommissioner(customer.address);

            expect(commissionerIds.length)
                .to
                .equal(2);
            expect(commissionerIds[0])
                .to
                .equal(1);
            expect(commissionerIds[1])
                .to
                .equal(2);
            expect(adminIds.length)
                .to
                .equal(1);
            expect(adminIds[0])
                .to
                .equal(3);
            expect(customerIds.length)
                .to
                .equal(0);
        });
    });
});
