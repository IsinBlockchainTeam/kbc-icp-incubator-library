/* eslint-disable camelcase */

import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { MaterialDriver } from './MaterialDriver';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    MaterialManager,
    MaterialManager__factory,
} from '../smart-contracts';
import { Material } from '../entities/Material';

describe('MaterialDriver', () => {
    let materialDriver: MaterialDriver;
    const companyAddress: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedMaterialManagerConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetMaterial = jest.fn();

    const mockedMaterialStructOutput = createMock<MaterialManager.MaterialStructOutput>();
    const mockedMaterial = createMock<Material>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber,
    });
    mockedGetMaterial.mockReturnValue(Promise.resolve(mockedMaterialStructOutput));

    const mockedContract = createMock<MaterialManager>({
        registerMaterial: mockedWriteFunction,
        updateMaterial: mockedWriteFunction,
        getMaterialsCounter: mockedReadFunction,
        getMaterialIds: mockedReadFunction,
        getMaterial: mockedGetMaterial,
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedMaterialManagerConnect.mockReturnValue(mockedContract);
        const mockedMaterialManager = createMock<MaterialManager>({
            connect: mockedMaterialManagerConnect,
        });
        jest.spyOn(MaterialManager__factory, 'connect').mockReturnValue(mockedMaterialManager);
        const buildMaterialSpy = jest.spyOn(EntityBuilder, 'buildMaterial');
        buildMaterialSpy.mockReturnValue(mockedMaterial);

        mockedSigner = createMock<Signer>();
        materialDriver = new MaterialDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly register a new Material', async () => {
        await materialDriver.registerMaterial(companyAddress, 'material');

        expect(mockedContract.registerMaterial).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerMaterial).toHaveBeenNthCalledWith(1, companyAddress, 'material');

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Material - FAIL(Not an address)', async () => {
        await expect(materialDriver.registerMaterial('notAnAddress', 'material'))
            .rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerMaterial).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });

    it('should correctly update a Material', async () => {
        await materialDriver.updateMaterial(0, 'material');

        expect(mockedContract.updateMaterial).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateMaterial).toHaveBeenNthCalledWith(1, 0, 'material');

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve a Material counter', async () => {
        const response = await materialDriver.getMaterialsCounter();

        expect(response).toEqual(1);

        expect(mockedContract.getMaterialsCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getMaterialsCounter).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve Material ids', async () => {
        mockedContract.getMaterialIds = jest.fn().mockResolvedValue([BigNumber.from(1), BigNumber.from(2)]);
        const response = await materialDriver.getMaterialIds(companyAddress);

        expect(response).toEqual([1, 2]);

        expect(mockedContract.getMaterialIds).toHaveBeenCalledTimes(1);
        expect(mockedContract.getMaterialIds).toHaveBeenNthCalledWith(1, companyAddress);
    });

    it('should correctly retrieve a Material', async () => {
        const response = await materialDriver.getMaterial(1);

        expect(response).toEqual(mockedMaterial);

        expect(mockedGetMaterial).toHaveBeenCalledTimes(1);
        expect(mockedGetMaterial).toHaveBeenNthCalledWith(1, 1);
    });
});
