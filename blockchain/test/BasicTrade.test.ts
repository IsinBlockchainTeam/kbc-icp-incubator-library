/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { BigNumber, Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import { MaterialManager } from '../typechain-types';

describe('BasicTrade.sol', () => {
    chai.use(smock.matchers);
    let productCategoryManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;
    let enumerableUnitManagerContractFake: FakeContract;

    let basicTradeContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress, customer: SignerWithAddress, commissioner: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com/';
    const metadataHash: string = 'metadataHash';
    const name: string = 'Test Trade';

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1)
    } as MaterialManager.MaterialStructOutput;
    const units = ['BG', 'KGM', 'H87'];

    before(async () => {
        [admin, supplier, customer, commissioner] = await ethers.getSigners();
        productCategoryManagerContractFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerContractFake.getProductCategoryExists.returns((value: number) => value <= 10);
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((value: number) => value <= 10);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        enumerableUnitManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableUnitManagerContractFake.contains.returns((value: string) => units.includes(value[0]));
    });

    beforeEach(async () => {
        const BasicTrade = await ethers.getContractFactory('BasicTrade');
        basicTradeContract = await BasicTrade.deploy(
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
            name
        );
        await basicTradeContract.deployed();
    });

    describe('Getters', () => {
        it('should get basic trade information', async () => {
            const [_tradeId, _supplier, _customer, _commissioner, _externalUrl, _linesId, _name] = await basicTradeContract.getTrade();
            expect(_tradeId).to.equal(1);
            expect(_supplier).to.equal(supplier.address);
            expect(_customer).to.equal(customer.address);
            expect(_commissioner).to.equal(commissioner.address);
            expect(_externalUrl).to.equal(`${externalUrl}1`);
            expect(_linesId).to.deep.equal([]);
            expect(_name).to.equal(name);
        });

        it('should get trade type', async () => {
            expect(await basicTradeContract.getTradeType()).to.equal(0);
        });
    });

    describe('Lines', () => {
        it('should add a line, retrieve it and update it', async () => {
            const tx = await basicTradeContract.addLine(1, 40, units[2]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(lineId).to.equal(1);

            const [id, productCategoryId, quantity, unit, materialId, exists] = await basicTradeContract.getLine(lineId);
            expect(id).to.equal(lineId);
            expect(productCategoryId).to.equal(BigNumber.from(1));
            expect(quantity).to.equal(BigNumber.from(40));
            expect(unit).to.equal(units[2]);
            expect(materialId).to.equal(BigNumber.from(0));
            expect(exists).to.equal(true);

            const updateTx = await basicTradeContract.updateLine(lineId, 2, 30, units[1]);
            const updatedReceipt = await updateTx.wait();
            expect(updatedReceipt.events.find((event: Event) => event.event === 'TradeLineUpdated').args[0]).to.equal(lineId);

            const [updatedId, updatedProductCategoryId, updatedQuantity, updatedUnit, updatedMaterialId, updatedExists] =
                await basicTradeContract.getLine(lineId);
            expect(updatedId).to.equal(lineId);
            expect(updatedProductCategoryId).to.deep.equal(BigNumber.from(2));
            expect(updatedQuantity).to.deep.equal(BigNumber.from(30));
            expect(updatedUnit).to.equal(units[1]);
            expect(updatedMaterialId).to.equal(BigNumber.from(0));
            expect(updatedExists).to.equal(true);

            const secondTx = await basicTradeContract.addLine(3, 50, units[0]);
            const secondReceipt = await secondTx.wait();
            const secondLineId = secondReceipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(secondLineId).to.equal(2);

            const lineCounter = await basicTradeContract.getLineCounter();
            expect(lineCounter).to.equal(2);
        });

        it('should assign a material to a line', async () => {
            const tx = await basicTradeContract.addLine(1, 40, units[2]);
            await tx.wait();

            const assignTx = await basicTradeContract.assignMaterial(1, 1);
            const receipt = await assignTx.wait();

            const [id, productCategoryId, quantity, unit, materialId, exists] = await basicTradeContract.getLine(1);
            expect(id).to.equal(1);
            expect(productCategoryId).to.equal(BigNumber.from(1));
            expect(quantity).to.equal(BigNumber.from(40));
            expect(unit).to.equal(units[2]);
            expect(materialId).to.equal(BigNumber.from(1));
            expect(exists).to.equal(true);
            expect(receipt.events.find((event: Event) => event.event === 'MaterialAssigned').args[0]).to.equal(1);
        });

        it('should add a line - FAIL (Trade: Product category does not exist)', async () => {
            await expect(basicTradeContract.addLine(20, 60, units[0])).to.be.revertedWith('Trade: Product category does not exist');
        });

        it('should add a line - FAIL (Trade: Unit has not been registered)', async () => {
            await expect(basicTradeContract.addLine(1, 60, 'custom unit')).to.be.revertedWith('Trade: Unit has not been registered');
        });

        it('should get a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.getLine(0)).to.be.revertedWith('Trade: Line does not exist');
        });

        it('should update a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.updateLine(0, 5, 50, units[1])).to.be.revertedWith('Trade: Line does not exist');
        });

        it('should update a line - FAIL (Trade: Product category does not exist)', async () => {
            const tx = await basicTradeContract.addLine(5, 40, units[0]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            await expect(basicTradeContract.updateLine(lineId, 20, 70, units[1])).to.be.revertedWith('Trade: Product category does not exist');
        });

        it('should update a line - FAIL (Trade: Unit has not been registered)', async () => {
            const tx = await basicTradeContract.addLine(5, 40, units[0]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            await expect(basicTradeContract.updateLine(lineId, 1, 70, 'custom unit')).to.be.revertedWith('Trade: Unit has not been registered');
        });

        it('should assign a material to a line - FAIL (Trade: Line does not exist)', async () => {
            await expect(basicTradeContract.assignMaterial(0, 1)).to.be.revertedWith('Trade: Line does not exist');
        });

        it('should assign a material to a line - FAIL (Trade: Material does not exist)', async () => {
            const tx = await basicTradeContract.addLine(1, 40, units[0]);
            await tx.wait();
            await expect(basicTradeContract.assignMaterial(1, 20)).to.be.revertedWith('Trade: Material does not exist');
        });
    });

    describe('Updates', () => {
        it('should update the name', async () => {
            const newName: string = 'New Test Trade';
            await basicTradeContract.setName(newName);
            const [, , , , , , _name] = await basicTradeContract.getTrade();
            expect(_name).to.equal(newName);
        });
    });
});
