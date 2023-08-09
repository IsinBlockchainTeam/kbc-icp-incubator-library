/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber } from 'ethers';

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('SupplyChainManager', () => {
    const deployFixture = async () => {
        const [address1, address2] = await ethers.getSigners();

        const SupplyChainManager = await ethers.getContractFactory('SupplyChainManager');
        const supplyChainManagerContract = await SupplyChainManager.deploy();
        await supplyChainManagerContract.deployed();
        return { address1, address2, supplyChainManagerContract };
    };

    describe('Registration', async () => {
        [
            { resource: 'Material', args: ['testMaterial'], expectedResource: { id: BigNumber.from(0), name: 'testMaterial' } },
            { resource: 'Trade', args: ['testTrade', [[1, 2], [3, 4]]], expectedResource: { id: BigNumber.from(0), name: 'testTrade', materialsIds: [[BigNumber.from(1), BigNumber.from(2)], [BigNumber.from(3), BigNumber.from(4)]] } },
            {
                resource: 'Transformation',
                args: ['testTransformation', [1, 2], 3],
                expectedResource: {
                    id: BigNumber.from(0), name: 'testTransformation', inputMaterialsIds: [BigNumber.from(1), BigNumber.from(2)], outputMaterialId: BigNumber.from(3),
                },
            },
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

                    const expectedResourceWithOwner = { ...expectedResource, owner: address1.address };
                    Object.keys(expectedResourceWithOwner).forEach((key) => {
                    // @ts-ignore
                        expect(registeredResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
                    });

                    await expect(tx).to.emit(supplyChainManagerContract, 'ResourceRegistered').withArgs(resource.toLowerCase(), address1.address, 0);
                });
            });
    });

    describe('Update', async () => {
        [
            {
                resource: 'Material', registerArgs: ['testMaterial'], updateArgs: [0, 'testMaterialNew'], expectedResource: { id: BigNumber.from(0), name: 'testMaterialNew' },
            },
            {
                resource: 'Trade', registerArgs: ['testTrade', [[1, 2], [3, 4]]], updateArgs: [0, 'testTradeNew', [[5, 6], [7, 8]]], expectedResource: { id: BigNumber.from(0), name: 'testTradeNew', materialsIds: [[BigNumber.from(5), BigNumber.from(6)], [BigNumber.from(7), BigNumber.from(8)]] },
            },
            {
                resource: 'Transformation',
                registerArgs: ['testTransformation', [1, 2], 3],
                updateArgs: [0, 'testTransformationNew', [4, 5], 6],
                expectedResource: {
                    id: BigNumber.from(0), name: 'testTransformationNew', inputMaterialsIds: [BigNumber.from(4), BigNumber.from(5)], outputMaterialId: BigNumber.from(6),
                },
            },
        ]
            .forEach(({
                resource, registerArgs, updateArgs, expectedResource,
            }) => {
                it(`should correctly update a ${resource}`, async () => {
                    const { address1, _, supplyChainManagerContract } = await loadFixture(deployFixture);

                    await (await supplyChainManagerContract[`register${resource}`](address1.address, ...registerArgs)).wait();
                    const tx = await supplyChainManagerContract[`update${resource}`](address1.address, ...updateArgs);
                    await tx.wait();

                    const currentResourceCounter = await supplyChainManagerContract[`get${resource}sCounter`](address1.address);
                    expect(currentResourceCounter).to.be.equal(1);
                    const updatedResource = await supplyChainManagerContract[`get${resource}`](address1.address, 0);

                    const expectedResourceWithOwner = { ...expectedResource, owner: address1.address };
                    Object.keys(expectedResourceWithOwner).forEach((key) => {
                        // @ts-ignore
                        expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
                    });

                    await expect(tx).to.emit(supplyChainManagerContract, 'ResourceUpdated').withArgs(resource.toLowerCase(), address1.address, 0);
                });
            });
    });
});
