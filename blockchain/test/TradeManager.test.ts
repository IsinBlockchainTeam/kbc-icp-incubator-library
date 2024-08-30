/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { Contract, Wallet, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { Trade } from '../typechain-types';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('TradeManager.sol', () => {
    let tradeManagerContract: Contract;
    let delegateManagerContractFake: FakeContract;
    let admin: SignerWithAddress,
        supplier: SignerWithAddress,
        customer: SignerWithAddress,
        commissioner: SignerWithAddress,
        arbiter: SignerWithAddress;
    const productCategoryManagerContractAddress: string = Wallet.createRandom().address;
    const materialManagerContractAddress: string = Wallet.createRandom().address;
    const documentManagerAddress: string = Wallet.createRandom().address;
    const fiatManagerAddress: string = Wallet.createRandom().address;
    const unitManagerAddress: string = Wallet.createRandom().address;
    const escrowManagerAddress: string = Wallet.createRandom().address;

    const roleProof: RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
        delegateCredentialIdHash: ethers.utils.formatBytes32String('delegateCredentialIdHash')
    };

    const externalUrl: string = 'https://test.com';
    const metadataHash: string = '0x123';
    const name: string = 'Test basic trade';
    const startDate = new Date();
    const paymentDeadline = new Date(startDate.setDate(startDate.getDate() + 1)).getTime();
    const documentDeliveryDeadline = new Date(startDate.setDate(new Date(paymentDeadline).getDate() + 1)).getTime();
    const shippingDeadline = new Date(startDate.setDate(new Date(documentDeliveryDeadline).getDate() + 1)).getTime();
    const deliveryDeadline = new Date(startDate.setDate(new Date(shippingDeadline).getDate() + 1)).getTime();
    const agreedAmount: number = 1000;
    const tokenAddress: string = Wallet.createRandom().address;

    let documentManagerContract: Contract;
    const _getTradeContract = async (id: number): Promise<Trade> => {
        const tradeAddress = await tradeManagerContract.getTrade(roleProof, id);
        const tradeType = await tradeManagerContract.getTradeType(roleProof, id);
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
        await ethers.provider.send('evm_mine', [Date.now() + 10]);
        [admin, supplier, customer, commissioner, arbiter] = await ethers.getSigners();
        roleProof.delegator = admin.address;
        // const EscrowManager = await ethers.getContractFactory(ContractName.ESCROW_MANAGER);
        // escrowManagerContract = await EscrowManager.deploy(Wallet.createRandom().address, 10, 1);
        // await escrowManagerContract.deployed();
    });

    beforeEach(async () => {
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);
        documentManagerContract = await DocumentManager.deploy(delegateManagerContractFake.address, []);
        await documentManagerContract.deployed();
        const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
        tradeManagerContract = await TradeManager.deploy(
            delegateManagerContractFake.address,
            productCategoryManagerContractAddress,
            materialManagerContractAddress,
            documentManagerContract.address,
            fiatManagerAddress,
            unitManagerAddress,
            escrowManagerAddress
        );
        await tradeManagerContract.deployed();
    });

    describe('TradeManager creation', () => {
        it('should create a TradeManager - FAIL(TradeManager: product category manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    ethers.constants.AddressZero,
                    materialManagerContractAddress,
                    documentManagerAddress,
                    fiatManagerAddress,
                    unitManagerAddress,
                    escrowManagerAddress
                )
            ).to.be.revertedWith('TradeManager: product category manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: material manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    productCategoryManagerContractAddress,
                    ethers.constants.AddressZero,
                    documentManagerAddress,
                    fiatManagerAddress,
                    unitManagerAddress,
                    escrowManagerAddress
                )
            ).to.be.revertedWith('TradeManager: material manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: document category manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    productCategoryManagerContractAddress,
                    materialManagerContractAddress,
                    ethers.constants.AddressZero,
                    fiatManagerAddress,
                    unitManagerAddress,
                    escrowManagerAddress
                )
            ).to.be.revertedWith('TradeManager: document category manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: fiat manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    productCategoryManagerContractAddress,
                    materialManagerContractAddress,
                    documentManagerAddress,
                    ethers.constants.AddressZero,
                    unitManagerAddress,
                    escrowManagerAddress
                )
            ).to.be.revertedWith('TradeManager: fiat manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: unit manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    productCategoryManagerContractAddress,
                    materialManagerContractAddress,
                    documentManagerAddress,
                    fiatManagerAddress,
                    ethers.constants.AddressZero,
                    escrowManagerAddress
                )
            ).to.be.revertedWith('TradeManager: unit manager address is the zero address');
        });

        it('should create a TradeManager - FAIL(TradeManager: escrow manager address is the zero address)', async () => {
            const TradeManager = await ethers.getContractFactory(ContractName.TRADE_MANAGER);
            await expect(
                TradeManager.deploy(
                    delegateManagerContractFake.address,
                    productCategoryManagerContractAddress,
                    materialManagerContractAddress,
                    documentManagerAddress,
                    fiatManagerAddress,
                    unitManagerAddress,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith('TradeManager: escrow manager address is the zero address');
        });
    });

    describe('Basic trades registration', () => {
        it('should register a basic trade and retrieve it', async () => {
            const tx = await tradeManagerContract.registerBasicTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                name
            );
            const receipt = await tx.wait();
            const eventArgs = receipt.events.find((event: Event) => event.event === 'BasicTradeRegistered').args;
            const id = eventArgs[0];

            expect(id).to.equal(1);
            // expect(eventArgs[1])
            //     .to
            //     .equal(supplier.address);
            // expect(eventArgs[2])
            //     .to
            //     .equal(customer.address);
            // expect(eventArgs[3])
            //     .to
            //     .equal(commissioner.address);

            const basicTradeAddress = await tradeManagerContract.getTrade(roleProof, id);
            const basicTradeContract = await ethers.getContractAt('BasicTrade', basicTradeAddress);

            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _name] = await basicTradeContract.getTrade(roleProof);
            expect(_tradeId).to.equal(id);
            expect(_supplier).to.equal(supplier.address);
            expect(_customer).to.equal(customer.address);
            expect(_commissioner).to.equal(commissioner.address);
            expect(_externalUrl).to.equal(`${externalUrl}${id}`);
            expect(_linesId.length).to.equal(0);
            expect(_name).to.equal(name);
        });

        it('should register a basic trade - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerBasicTrade(
                    roleProof,
                    ethers.constants.AddressZero,
                    customer.address,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    name
                )
            ).to.be.revertedWith('TradeManager: supplier is the zero address');
        });

        it('should register a basic trade - FAIL(TradeManager: customer is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerBasicTrade(
                    roleProof,
                    supplier.address,
                    ethers.constants.AddressZero,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    name
                )
            ).to.be.revertedWith('TradeManager: customer is the zero address');
        });

        it('should register a basic trade - FAIL(TradeManager: commissioner is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerBasicTrade(
                    roleProof,
                    supplier.address,
                    customer.address,
                    ethers.constants.AddressZero,
                    externalUrl,
                    metadataHash,
                    name
                )
            ).to.be.revertedWith('TradeManager: commissioner is the zero address');
        });
    });

    describe('Order trades registration', async () => {
        it('should register an order trade and retrieve it', async () => {
            const tx = await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            const receipt = await tx.wait();
            const eventArgs = receipt.events.find((event: Event) => event.event === 'OrderTradeRegistered').args;
            const id = eventArgs[0];

            expect(id).to.equal(1);
            // expect(eventArgs[1])
            //     .to
            //     .equal(supplier.address);
            // expect(eventArgs[2])
            //     .to
            //     .equal(customer.address);
            // expect(eventArgs[3])
            //     .to
            //     .equal(commissioner.address);

            const orderTradeAddress = await tradeManagerContract.getTrade(roleProof, id);
            const orderTradeContract = await ethers.getContractAt(ContractName.ORDER_TRADE, orderTradeAddress);

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
                _negotiationStatus,
                _agreedAmount,
                _tokenAddress,
                _escrow
            ] = await orderTradeContract.getTrade(roleProof);
            expect(_tradeId).to.equal(id);
            expect(_supplier).to.equal(supplier.address);
            expect(_customer).to.equal(customer.address);
            expect(_commissioner).to.equal(commissioner.address);
            expect(_externalUrl).to.equal(`${externalUrl}${id}`);
            expect(_linesId.length).to.equal(0);
            expect(_hasSupplierSigned).to.equal(false);
            expect(_hasCommissionerSigned).to.equal(false);
            expect(_paymentDeadline).to.equal(paymentDeadline);
            expect(_documentDeliveryDeadline).to.equal(documentDeliveryDeadline);
            expect(_arbiter).to.equal(arbiter.address);
            expect(_shippingDeadline).to.equal(shippingDeadline);
            expect(_deliveryDeadline).to.equal(deliveryDeadline);
            expect(_negotiationStatus).to.equal(0);
            expect(_agreedAmount).to.equal(agreedAmount);
            expect(_tokenAddress).to.equal(tokenAddress);
            expect(_escrow).to.not.be.undefined;
            expect(_escrow).to.equal(ethers.constants.AddressZero);
        });

        it('should register an order trade - - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerOrderTrade(
                    roleProof,
                    ethers.constants.AddressZero,
                    customer.address,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    paymentDeadline,
                    documentDeliveryDeadline,
                    arbiter.address,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                )
            ).to.be.revertedWith('TradeManager: supplier is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: customer is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerOrderTrade(
                    roleProof,
                    supplier.address,
                    ethers.constants.AddressZero,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    paymentDeadline,
                    documentDeliveryDeadline,
                    arbiter.address,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                )
            ).to.be.revertedWith('TradeManager: customer is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: supplier is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerOrderTrade(
                    roleProof,
                    supplier.address,
                    customer.address,
                    ethers.constants.AddressZero,
                    externalUrl,
                    metadataHash,
                    paymentDeadline,
                    documentDeliveryDeadline,
                    arbiter.address,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                )
            ).to.be.revertedWith('TradeManager: commissioner is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: arbiter is the zero address)', async () => {
            await expect(
                tradeManagerContract.registerOrderTrade(
                    roleProof,
                    supplier.address,
                    customer.address,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    paymentDeadline,
                    documentDeliveryDeadline,
                    ethers.constants.AddressZero,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                )
            ).to.be.revertedWith('TradeManager: arbiter is the zero address');
        });

        it('should register an order trade - - FAIL(TradeManager: payment deadline must be in the future)', async () => {
            await expect(
                tradeManagerContract.registerOrderTrade(
                    roleProof,
                    supplier.address,
                    customer.address,
                    commissioner.address,
                    externalUrl,
                    metadataHash,
                    0,
                    documentDeliveryDeadline,
                    arbiter.address,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                )
            ).to.be.revertedWith('TradeManager: payment deadline must be in the future');
        });
    });

    describe('Getters', () => {
        it('should get all trades', async () => {
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                Wallet.createRandom().address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                admin.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );

            expect(await tradeManagerContract.getTradeCounter(roleProof)).to.equal(3);

            const firstTrade = await _getTradeContract(1);
            expect(firstTrade.address).to.equal(await tradeManagerContract.getTrade(roleProof, 1));

            const secondTrade = await _getTradeContract(2);
            expect(secondTrade.address).to.equal(await tradeManagerContract.getTrade(roleProof, 2));

            const thirdTrade = await _getTradeContract(3);
            expect(thirdTrade.address).to.equal(await tradeManagerContract.getTrade(roleProof, 3));
        });

        it('should get all trades and types', async () => {
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerBasicTrade(
                roleProof,
                Wallet.createRandom().address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                'test'
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                admin.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );

            expect(await tradeManagerContract.getTradeCounter(roleProof)).to.equal(3);

            const firstTrade = await _getTradeContract(1);
            expect(await firstTrade.getTradeType(roleProof)).to.equal(await tradeManagerContract.getTradeType(roleProof, 1));

            const secondTrade = await _getTradeContract(2);
            expect(await secondTrade.getTradeType(roleProof)).to.equal(await tradeManagerContract.getTradeType(roleProof, 2));

            const thirdTrade = await _getTradeContract(3);
            expect(await thirdTrade.getTradeType(roleProof)).to.equal(await tradeManagerContract.getTradeType(roleProof, 3));
        });

        it('should get trade IDs of supplier', async () => {
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                Wallet.createRandom().address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                admin.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );

            const supplierIds = await tradeManagerContract.getTradeIdsOfSupplier(roleProof, supplier.address);
            const adminIds = await tradeManagerContract.getTradeIdsOfSupplier(roleProof, admin.address);

            expect(supplierIds.length).to.equal(2);
            expect(supplierIds[0]).to.equal(1);
            expect(supplierIds[1]).to.equal(3);
            expect(adminIds.length).to.equal(0);
        });

        it('should get trade IDs of commissioner', async () => {
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                Wallet.createRandom().address,
                customer.address,
                commissioner.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );
            await tradeManagerContract.registerOrderTrade(
                roleProof,
                supplier.address,
                customer.address,
                admin.address,
                externalUrl,
                metadataHash,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter.address,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                tokenAddress
            );

            const commissionerIds = await tradeManagerContract.getTradeIdsOfCommissioner(roleProof, commissioner.address);
            const adminIds = await tradeManagerContract.getTradeIdsOfCommissioner(roleProof, admin.address);
            const customerIds = await tradeManagerContract.getTradeIdsOfCommissioner(roleProof, customer.address);

            expect(commissionerIds.length).to.equal(2);
            expect(commissionerIds[0]).to.equal(1);
            expect(commissionerIds[1]).to.equal(2);
            expect(adminIds.length).to.equal(1);
            expect(adminIds[0]).to.equal(3);
            expect(customerIds.length).to.equal(0);
        });
    });
});
