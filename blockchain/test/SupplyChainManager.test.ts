import {ethers} from "hardhat";
import {expect} from "chai";
import {SupplyChainManager} from "../typechain-types";
import {BigNumber} from "ethers";
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe('SupplyChainManager', () => {
    const deployFixture = async () => {
        const [address1, address2] = await ethers.getSigners();

        const SupplyChainManager = await ethers.getContractFactory('SupplyChainManager');
        const supplyChainManagerContract = await SupplyChainManager.deploy();
        await supplyChainManagerContract.deployed();
        return { address1, address2, supplyChainManagerContract };
    }

    describe('Registration', async () => {
        [
            { resource: 'Material', args: ['testMaterial'], expectedResource: { id: BigNumber.from(0), name: 'testMaterial' } },
            { resource: 'Trade', args: ['testTrade', [[1, 2], [3, 4]]], expectedResource: { id: BigNumber.from(0), name: 'testTrade', materialsIds: [[BigNumber.from(1), BigNumber.from(2)], [BigNumber.from(3), BigNumber.from(4)]] } },
            { resource: 'Transformation', args: ['testTransformation', [1, 2], 3], expectedResource: { id: BigNumber.from(0), name: 'testTransformation', inputMaterialsIds: [BigNumber.from(1), BigNumber.from(2)], outputMaterialId: BigNumber.from(3) } },
        ]
        .forEach(({ resource, args, expectedResource }) => {
            it(`should correctly register a ${resource}`, async () => {
                const { address1, _, supplyChainManagerContract } = await loadFixture(deployFixture);

                const previousResourceCounter = await supplyChainManagerContract[`get${resource}sCounter`](address1.address);
                expect(previousResourceCounter).to.be.equal(0);
                const tx = await supplyChainManagerContract[`register${resource}`](address1.address, ...args);
                await tx.wait();

                const currentResourceCounter = await supplyChainManagerContract[`get${resource}sCounter`](address1.address);
                expect(currentResourceCounter).to.be.equal(1);
                const registeredResource = await supplyChainManagerContract[`get${resource}`](address1.address, 0);

                const expectedResourceWithOwner = {...expectedResource, owner: address1.address};
                Object.keys(expectedResourceWithOwner).forEach((key) => {
                    // @ts-ignore
                    expect(registeredResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
                });
            });
        });
    });

});
