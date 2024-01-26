/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { BigNumber, Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import {MaterialManager} from "../typechain-types";

describe('BasicTrade.sol', () => {
    chai.use(smock.matchers);
    let productCategoryManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;

    let basicTradeContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress,
        customer: SignerWithAddress, commissioner: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com';
    const name: string = 'Test Trade';

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1),
    } as MaterialManager.MaterialStructOutput;

    before(async () => {
        [admin, supplier, customer, commissioner] = await ethers.getSigners();
        productCategoryManagerContractFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerContractFake.getProductCategoryExists.returns((value: number) => value <= 10);
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((value: number) => value <= 10);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
    });

    beforeEach(async () => {
        const BasicTrade = await ethers.getContractFactory('BasicTrade');
        basicTradeContract = await BasicTrade.deploy(0, productCategoryManagerContractFake.address, materialManagerContractFake.address,
            documentManagerContractFake.address, supplier.address, customer.address, commissioner.address, externalUrl, name);
        await basicTradeContract.deployed();
    });

    describe('Getters', () => {
        it('should get basic trade information', async () => {
            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _name] = await basicTradeContract.getTrade();
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
            expect(_name)
                .to
                .equal(name);
        });

        it('should get trade type', async () => {
            expect(await basicTradeContract.getTradeType())
                .to
                .equal(0);
        });
    });

    describe('Lines', () => {
        it('should add a line, retrieve it and update it', async () => {
            const tx = await basicTradeContract.addLine(1);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(lineId)
                .to
                .equal(0);

            const [id, productCategoryId, materialId, exists] = await basicTradeContract.getLine(lineId);
            expect(id)
                .to
                .equal(lineId);
            expect(productCategoryId)
                .to
                .equal(BigNumber.from(1));
            expect(materialId)
                .to
                .equal(BigNumber.from(0));
            expect(exists)
                .to
                .equal(true);

            const updateTx = await basicTradeContract.updateLine(lineId, 2);
            const updatedReceipt = await updateTx.wait();
            expect(updatedReceipt.events.find((event: Event) => event.event === 'TradeLineUpdated').args[0])
                .to
                .equal(lineId);

            const [updatedId, updatedProductCategoryId, updatedMaterialId, updatedExists] = await basicTradeContract.getLine(lineId);
            expect(updatedId)
                .to
                .equal(lineId);
            expect(updatedProductCategoryId)
                .to
                .deep
                .equal(BigNumber.from(2));
            expect(updatedMaterialId)
                .to
                .equal(BigNumber.from(0));
            expect(updatedExists)
                .to
                .equal(true);

            const secondTx = await basicTradeContract.addLine(3);
            const secondReceipt = await secondTx.wait();
            const secondLineId = secondReceipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(secondLineId)
                .to
                .equal(1);

            const lineCounter = await basicTradeContract.getLineCounter();
            expect(lineCounter)
                .to
                .equal(2);
        });

        it('should assign a material to a line', async () => {
            const tx = await basicTradeContract.addLine(1);
            await tx.wait();

            const assignTx = await basicTradeContract.assignMaterial(0, 1);
            const receipt = await assignTx.wait();

            const [id, productCategoryId, materialId, exists] = await basicTradeContract.getLine(0);
            expect(id)
                .to
                .equal(0);
            expect(productCategoryId)
                .to
                .equal(BigNumber.from(1));
            expect(materialId)
                .to
                .equal(BigNumber.from(1));
            expect(exists)
                .to
                .equal(true);
            expect(receipt.events.find((event: Event) => event.event === 'MaterialAssigned').args[0]).to.equal(0);
        });

        it('should add a line - FAIL (Trade: Product category does not exist)', async () => {
            await expect(basicTradeContract.addLine(20))
                .to
                .be
                .revertedWith('Trade: Product category does not exist');
        });

        it('should get a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.getLine(0))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should update a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.updateLine(0, 5))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should update a line - FAIL (Trade: Product category does not exist)', async () => {
            const tx = await basicTradeContract.addLine(5);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            await expect(basicTradeContract.updateLine(lineId, 20))
                .to
                .be
                .revertedWith('Trade: Product category does not exist');
        });

        it('should assign a material to a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.assignMaterial(0, 1))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should assign a material to a line - FAIL (Trade: Material does not exist)', async () => {
            const tx = await basicTradeContract.addLine(1);
            await tx.wait();
            await expect(basicTradeContract.assignMaterial(0, 20))
                .to
                .be
                .revertedWith('Trade: Material does not exist');
        });
    });

    describe('Updates', () => {
        it('should update the name', async () => {
            const newName: string = 'New Test Trade';
            await basicTradeContract.setName(newName);
            const [, , , , , , _name] = await basicTradeContract.getTrade();
            expect(_name)
                .to
                .equal(newName);
        });
    });
});
