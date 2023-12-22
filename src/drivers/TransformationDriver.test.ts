import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    TransformationManager,
    TransformationManager__factory,
} from '../smart-contracts';
import { Transformation } from '../entities/Transformation';
import { TransformationDriver } from './TransformationDriver';

describe('TransformationDriver', () => {
    let transformationDriver: TransformationDriver;
    const companyAddress: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedTransformationManagerConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetTransformation = jest.fn();

    const mockedTransformationStructOutput = createMock<TransformationManager.TransformationStructOutput>();
    const mockedTransformation = createMock<Transformation>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber,
    });
    mockedGetTransformation.mockReturnValue(Promise.resolve(mockedTransformationStructOutput));

    const mockedContract = createMock<TransformationManager>({
        registerTransformation: mockedWriteFunction,
        updateTransformation: mockedWriteFunction,
        getTransformationsCounter: mockedReadFunction,
        getTransformationIds: mockedReadFunction,
        getTransformation: mockedGetTransformation,
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedTransformationManagerConnect.mockReturnValue(mockedContract);
        const mockedTransformationManager = createMock<TransformationManager>({
            connect: mockedTransformationManagerConnect,
        });
        jest.spyOn(TransformationManager__factory, 'connect').mockReturnValue(mockedTransformationManager);
        const buildTransformationSpy = jest.spyOn(EntityBuilder, 'buildTransformation');
        buildTransformationSpy.mockReturnValue(mockedTransformation);

        mockedSigner = createMock<Signer>();
        transformationDriver = new TransformationDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly register a new Transformation', async () => {
        await transformationDriver.registerTransformation(companyAddress, 'transformation', [1, 2], 3);

        expect(mockedContract.registerTransformation).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerTransformation).toHaveBeenNthCalledWith(1, companyAddress, 'transformation', [1, 2], 3);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Transformation - FAIL(Not an address)', async () => {
        await expect(transformationDriver.registerTransformation('notAnAddress', 'transformation', [1, 2], 3))
            .rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerTransformation).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });

    it('should correctly update a Transformation', async () => {
        await transformationDriver.updateTransformation(0, 'transformation', [1, 2], 3);

        expect(mockedContract.updateTransformation).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateTransformation).toHaveBeenNthCalledWith(1, 0, 'transformation', [1, 2], 3);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve Transformation counter', async () => {
        const response = await transformationDriver.getTransformationsCounter();

        expect(response).toEqual(1);

        expect(mockedContract.getTransformationsCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTransformationsCounter).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve Transformation ids', async () => {
        mockedContract.getTransformationIds = jest.fn().mockResolvedValue([BigNumber.from(1), BigNumber.from(2)]);
        const response = await transformationDriver.getTransformationIds(companyAddress);

        expect(response).toEqual([1, 2]);

        expect(mockedContract.getTransformationIds).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTransformationIds).toHaveBeenNthCalledWith(1, companyAddress);
    });

    it('should correctly retrieve a Transformation', async () => {
        const response = await transformationDriver.getTransformation(1);

        expect(response).toEqual(mockedTransformation);

        expect(mockedGetTransformation).toHaveBeenCalledTimes(1);
        expect(mockedGetTransformation).toHaveBeenNthCalledWith(1, 1);
    });
});
