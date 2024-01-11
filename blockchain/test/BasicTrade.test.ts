import { ethers } from 'hardhat';
import { BigNumber, Contract, Event } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

describe('BasicTrade.sol', () => {
    chai.use(smock.matchers);
    let enumerableProductCategoryManagerContractFake: FakeContract;
    const categories = ['Arabic 85', 'Excelsa 88'];
    let documentManagerContractFake: FakeContract;

    let basicTradeContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress,
        customer: SignerWithAddress, commissioner: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com';
    const name: string = 'Test Trade';

    before(async () => {
        [admin, supplier, customer, commissioner] = await ethers.getSigners();
        enumerableProductCategoryManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableProductCategoryManagerContractFake.contains.returns((value: string) => categories.includes(value[0]));
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
    });

    beforeEach(async () => {
        const BasicTrade = await ethers.getContractFactory('BasicTrade');
        basicTradeContract = await BasicTrade.deploy(0, enumerableProductCategoryManagerContractFake.address,
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
            const tx = await basicTradeContract.addLine([1, 2], categories[0]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(lineId)
                .to
                .equal(0);

            const [id, materialsId, productCategory, exists] = await basicTradeContract.getLine(lineId);
            expect(id)
                .to
                .equal(lineId);
            expect(materialsId)
                .to
                .deep
                .equal([1, 2]);
            expect(productCategory)
                .to
                .equal(categories[0]);
            expect(exists)
                .to
                .equal(true);

            const newMaterialsId = [3, 4];
            const updateTx = await basicTradeContract.updateLine(lineId, newMaterialsId, categories[1]);
            const updatedReceipt = await updateTx.wait();
            expect(updatedReceipt.events.find((event: Event) => event.event === 'TradeLineUpdated').args[0])
                .to
                .equal(lineId);

            const [updatedId, updatedMaterialsId, updatedProductCategory, updatedExists] = await basicTradeContract.getLine(lineId);
            expect(updatedId)
                .to
                .equal(lineId);
            expect(updatedMaterialsId)
                .to
                .deep
                .equal(newMaterialsId);
            expect(updatedProductCategory)
                .to
                .equal(categories[1]);
            expect(updatedExists)
                .to
                .equal(true);

            const secondMaterialsId = [5, 6];
            const secondTx = await basicTradeContract.addLine(secondMaterialsId, categories[0]);
            const secondReceipt = await secondTx.wait();
            const secondLineId = secondReceipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            expect(secondLineId)
                .to
                .equal(1);

            const lines = await basicTradeContract.getLines();
            expect(lines.length)
                .to
                .equal(2);
            expect(lines[0])
                .to
                .deep
                .equal([lineId, newMaterialsId.map((number) => BigNumber.from(number)), categories[1], true]);
            expect(lines[1])
                .to
                .deep
                .equal([secondLineId, secondMaterialsId.map((number) => BigNumber.from(number)), categories[0], true]);
        });

        it('should add a line - FAIL (Trade: Product category does not exist)', async () => {
            await expect(basicTradeContract.addLine([1, 2], 'Not existing category'))
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
            await expect(basicTradeContract.updateLine(0, [1, 2], categories[0]))
                .to
                .be
                .revertedWith('Trade: Line does not exist');
        });

        it('should update a line - FAIL (Trade: Product category does not exist)', async () => {
            const tx = await basicTradeContract.addLine([1, 2], categories[0]);
            const receipt = await tx.wait();
            const lineId = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
            await expect(basicTradeContract.updateLine(lineId, [1, 2], 'Not existing category'))
                .to
                .be
                .revertedWith('Trade: Product category does not exist');
        });
    })

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
