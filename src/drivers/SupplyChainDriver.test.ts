/* eslint-disable camelcase */

import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { SupplyChainDriver } from './SupplyChainDriver';
import { EntityBuilder } from '../utils/EntityBuilder';
import { SupplyChainManager, SupplyChainManager__factory } from '../smart-contracts';
import { Transformation } from '../entities/Transformation';
import { Material } from '../entities/Material';
import { MaterialStructOutput, TransformationStructOutput } from '../smart-contracts/contracts/SupplyChainManager';

describe('SupplyChainDriver', () => {
    let supplyChainDriver: SupplyChainDriver;
    const companyAddress: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedSupplyChainManagerConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetMaterial = jest.fn();
    const mockedGetTransformation = jest.fn();

    const mockedMaterialStructOutput = createMock<MaterialStructOutput>();
    const mockedTransformationStructOutput = createMock<TransformationStructOutput>();
    const mockedMaterial = createMock<Material>();
    const mockedTransformation = createMock<Transformation>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber,
    });
    mockedGetMaterial.mockReturnValue(Promise.resolve(mockedMaterialStructOutput));
    mockedGetTransformation.mockReturnValue(Promise.resolve(mockedTransformationStructOutput));

    const mockedContract = createMock<SupplyChainManager>({
        registerMaterial: mockedWriteFunction,
        registerTransformation: mockedWriteFunction,
        updateMaterial: mockedWriteFunction,
        updateTransformation: mockedWriteFunction,
        getMaterialsCounter: mockedReadFunction,
        getMaterialIds: mockedReadFunction,
        getTransformationsCounter: mockedReadFunction,
        getTransformationIds: mockedReadFunction,
        getMaterial: mockedGetMaterial,
        getTransformation: mockedGetTransformation,
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedSupplyChainManagerConnect.mockReturnValue(mockedContract);
        const mockedSupplyChainManager = createMock<SupplyChainManager>({
            connect: mockedSupplyChainManagerConnect,
        });
        jest.spyOn(SupplyChainManager__factory, 'connect').mockReturnValue(mockedSupplyChainManager);
        const buildMaterialSpy = jest.spyOn(EntityBuilder, 'buildMaterial');
        buildMaterialSpy.mockReturnValue(mockedMaterial);
        const buildTransformationSpy = jest.spyOn(EntityBuilder, 'buildTransformation');
        buildTransformationSpy.mockReturnValue(mockedTransformation);

        mockedSigner = createMock<Signer>();
        supplyChainDriver = new SupplyChainDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            resource: 'Material',
            method: () => supplyChainDriver.registerMaterial(companyAddress, 'material'),
            mockedRegister: mockedContract.registerMaterial,
            mockedRegisterArgs: [companyAddress, 'material'],
        },
        {
            resource: 'Transformation',
            method: () => supplyChainDriver.registerTransformation(companyAddress, 'transformation', [1, 2], 3),
            mockedRegister: mockedContract.registerTransformation,
            mockedRegisterArgs: [companyAddress, 'transformation', [1, 2], 3],
        },
    ])('should correctly register a new $resource', async ({ resource, method, mockedRegister, mockedRegisterArgs }) => {
        await method();

        expect(mockedRegister).toHaveBeenCalledTimes(1);
        expect(mockedRegister).toHaveBeenNthCalledWith(1, ...mockedRegisterArgs);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it.each([
        {
            resource: 'Material',
            method: () => supplyChainDriver.registerMaterial('notAnAddress', 'material'),
            mockedRegister: mockedContract.registerMaterial,
        },
        {
            resource: 'Transformation',
            method: () => supplyChainDriver.registerTransformation('notAnAddress', 'transformation', [1, 2], 3),
            mockedRegister: mockedContract.registerTransformation,
        },
    ])('should not register a new $resource - not an address', async ({ resource, method, mockedRegister }) => {
        await expect(method()).rejects.toThrow(new Error('Not an address'));

        expect(mockedRegister).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });

    it.each([
        {
            resource: 'Material',
            method: () => supplyChainDriver.updateMaterial(0, 'material'),
            mockedUpdate: mockedContract.updateMaterial,
            mockedUpdateArgs: [0, 'material'],
        },
        {
            resource: 'Transformation',
            method: () => supplyChainDriver.updateTransformation(0, 'transformation', [1, 2], 3),
            mockedUpdate: mockedContract.updateTransformation,
            mockedUpdateArgs: [0, 'transformation', [1, 2], 3],
        },
    ])('should correctly update a $resource', async ({ resource, method, mockedUpdate, mockedUpdateArgs }) => {
        await method();

        expect(mockedUpdate).toHaveBeenCalledTimes(1);
        expect(mockedUpdate).toHaveBeenNthCalledWith(1, ...mockedUpdateArgs);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it.each([
        {
            resource: 'Material',
            method: () => supplyChainDriver.getMaterialsCounter(),
            mockedGetCounter: mockedContract.getMaterialsCounter,
            mockedGetCounterArgs: [],
        },
        {
            resource: 'Transformation',
            method: () => supplyChainDriver.getTransformationsCounter(),
            mockedGetCounter: mockedContract.getTransformationsCounter,
            mockedGetCounterArgs: [],
        },
    ])('should correctly retrieve $resource counter', async ({ method, mockedGetCounter, mockedGetCounterArgs }) => {
        const response = await method();

        expect(response).toEqual(1);

        expect(mockedGetCounter).toHaveBeenCalledTimes(1);
        expect(mockedGetCounter).toHaveBeenNthCalledWith(1, ...mockedGetCounterArgs);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it.each([
        {
            resource: 'Material',
            method: (address: string) => supplyChainDriver.getMaterialIds(address),
            resolveMockedIds: (ids: BigNumber[]) => {
                mockedContract.getMaterialIds = jest.fn().mockResolvedValue(ids);
                return mockedContract.getMaterialIds;
            },
        },
        {
            resource: 'Transformation',
            method: (address: string) => supplyChainDriver.getTransformationIds(address),
            resolveMockedIds: (ids: BigNumber[]) => {
                mockedContract.getTransformationIds = jest.fn().mockResolvedValue(ids);
                return mockedContract.getTransformationIds;
            },
        },
    ])('should correctly retrieve $resource ids', async ({ method, resolveMockedIds }) => {
        const mockedGetIds = resolveMockedIds([BigNumber.from(1), BigNumber.from(2)]);
        const response = await method(companyAddress);

        expect(response).toEqual([1, 2]);

        expect(mockedGetIds).toHaveBeenCalledTimes(1);
        expect(mockedGetIds).toHaveBeenNthCalledWith(1, companyAddress);
    });

    it.each([
        {
            resource: 'Material',
            method: () => supplyChainDriver.getMaterial(1),
            mockedGet: mockedGetMaterial,
            mockedGetArgs: [1],
            mockedResource: mockedMaterial,
        },
        {
            resource: 'Transformation',
            method: () => supplyChainDriver.getTransformation(1),
            mockedGet: mockedGetTransformation,
            mockedGetArgs: [1],
            mockedResource: mockedTransformation,
        },
    ])('should correctly retrieve $resource', async ({ method, mockedGet, mockedGetArgs, mockedResource }) => {
        const response = await method();

        expect(response).toEqual(mockedResource);

        expect(mockedGet).toHaveBeenCalledTimes(1);
        expect(mockedGet).toHaveBeenNthCalledWith(1, ...mockedGetArgs);
    });
});
