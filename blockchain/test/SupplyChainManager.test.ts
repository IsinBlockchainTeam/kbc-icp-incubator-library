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
            { resource: 'Material', args: ['testMaterial'], expectedResource: { id: BigNumber.from(1), name: 'testMaterial' } },
            {
                resource: 'Transformation',
                args: ['testTransformation', [1, 2], 3],
                expectedResource: {
                    id: BigNumber.from(1), name: 'testTransformation', inputMaterialsIds: [BigNumber.from(1), BigNumber.from(2)], outputMaterialId: BigNumber.from(3),
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
                    const registeredResource = await supplyChainManagerContract[`get${resource}`](address1.address, 1);

                    const expectedResourceWithOwner = { ...expectedResource, owner: address1.address };
                    Object.keys(expectedResourceWithOwner).forEach((key) => {
                    // @ts-ignore
                        expect(registeredResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
                    });

                    await expect(tx).to.emit(supplyChainManagerContract, 'ResourceRegistered').withArgs(resource.toLowerCase(), address1.address, 1);
                });
            });
    });

    describe('Update', async () => {
        [
            {
                resource: 'Material', registerArgs: ['testMaterial'], updateArgs: [1, 'testMaterialNew'], expectedResource: { id: BigNumber.from(1), name: 'testMaterialNew' },
            },
            {
                resource: 'Transformation',
                registerArgs: ['testTransformation', [1, 2], 3],
                updateArgs: [1, 'testTransformationNew', [4, 5], 6],
                expectedResource: {
                    id: BigNumber.from(1), name: 'testTransformationNew', inputMaterialsIds: [BigNumber.from(4), BigNumber.from(5)], outputMaterialId: BigNumber.from(6),
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
                    const updatedResource = await supplyChainManagerContract[`get${resource}`](address1.address, 1);

                    const expectedResourceWithOwner = { ...expectedResource, owner: address1.address };
                    Object.keys(expectedResourceWithOwner).forEach((key) => {
                        // @ts-ignore
                        expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
                    });

                    await expect(tx).to.emit(supplyChainManagerContract, 'ResourceUpdated').withArgs(resource.toLowerCase(), address1.address, 1);
                });
            });
    });
});
