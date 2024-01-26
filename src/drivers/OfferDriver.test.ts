/* eslint-disable camelcase */

import {BigNumber, ethers, Signer, Wallet} from 'ethers';
import { createMock } from 'ts-auto-mock';
import { OfferDriver } from './OfferDriver';
import {
    OfferManager,
    OfferManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Offer } from '../entities/Offer';

describe('OfferDriver', () => {
    let offerDriver: OfferDriver;

    const companyNames = ['Company 1', 'Company 2'];
    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
        id: BigNumber.from(2),
        name: 'category1',
        quality: 85,
        description: 'description',
        exists: true,
    } as ProductCategoryManager.ProductCategoryStructOutput;

    let mockedSigner: Signer;
    let mockedContract: OfferManager;

    const mockedOfferConnect = jest.fn();
    const mockedProductCategoryManagerConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedRegisterOffer = jest.fn();
    const mockedRegisterSupplier = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedReadStringFunction = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const mockedOfferRegisteredEventFilter = jest.fn();
    const mockedOfferUpdatedEventFilter = jest.fn();
    const mockedOfferDeletedEventFilter = jest.fn();
    const mockedOfferSupplierRegisteredEventFilter = jest.fn();
    const mockedOfferSupplierUpdatedEventFilter = jest.fn();
    const mockedOfferSupplierDeletedEventFilter = jest.fn();
    const mockedGetProductCategory = jest.fn();

    const companyOwner = ethers.Wallet.createRandom();

    const buildOfferSpy = jest.spyOn(EntityBuilder, 'buildOffer');

    mockedGetProductCategory.mockReturnValue(productCategoryStruct);
    const mockedOffer = createMock<Offer>();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedReadStringFunction.mockResolvedValue('test');
        mockedRegisterSupplier.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OfferSupplierRegistered' }] }),
        }));
        mockedRegisterOffer.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OfferRegistered' }] }),
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedContract = createMock<OfferManager>({
            registerSupplier: mockedRegisterSupplier,
            registerOffer: mockedRegisterOffer,
            getLastId: mockedReadFunction,
            getOfferIdsByCompany: mockedReadFunction,
            getSupplierName: mockedReadFunction,
            getOffer: mockedReadFunction,
            updateSupplier: mockedWriteFunction,
            updateOffer: mockedWriteFunction,
            deleteSupplier: mockedWriteFunction,
            deleteOffer: mockedWriteFunction,
            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
            filters: {
                OfferRegistered: mockedOfferRegisteredEventFilter,
                OfferUpdated: mockedOfferUpdatedEventFilter,
                OfferDeleted: mockedOfferDeletedEventFilter,
                OfferSupplierRegistered: mockedOfferSupplierRegisteredEventFilter,
                OfferSupplierUpdated: mockedOfferSupplierUpdatedEventFilter,
                OfferSupplierDeleted: mockedOfferSupplierDeletedEventFilter,
            },
        });

        const mockedProductCategoryContract = createMock<ProductCategoryManager>({
            getProductCategory: mockedGetProductCategory
        });

        mockedOfferConnect.mockReturnValue(mockedContract);
        const mockedOfferManager = createMock<OfferManager>({
            connect: mockedOfferConnect,
        });
        mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
        const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect,
        });
        jest.spyOn(OfferManager__factory, 'connect')
            .mockReturnValue(mockedOfferManager);
        jest.spyOn(ProductCategoryManager__factory, 'connect')
            .mockReturnValue(mockedProductCategoryManagerContract);

        buildOfferSpy.mockReturnValue(mockedOffer);

        mockedSigner = createMock<Signer>();
        offerDriver = new OfferDriver(
            mockedSigner,
            testAddress,
            Wallet.createRandom().address,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerSupplier', () => {
        it('should call and wait for register a supplier', async () => {
            await offerDriver.registerSupplier(companyOwner.address, companyNames[0]);

            expect(mockedRegisterSupplier).toHaveBeenCalledTimes(1);
            expect(mockedRegisterSupplier).toHaveBeenNthCalledWith(1, companyOwner.address, companyNames[0]);
            expect(mockedWait).toHaveBeenCalledTimes(1);

            expect(mockedContract.registerSupplier).toHaveBeenCalledTimes(1);
            expect(mockedContract.registerSupplier).toHaveBeenNthCalledWith(1, companyOwner.address, companyNames[0]);
        });

        it('should call and wait for register a supplier - transaction fails', async () => {
            mockedRegisterSupplier.mockRejectedValueOnce(new Error(errorMessage));

            const fn = async () => offerDriver.registerSupplier(companyOwner.address, companyNames[0]);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register a supplier - fails for companyOwner address', async () => {
            const fn = async () => offerDriver.registerSupplier('0xaddress', companyNames[0]);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('registerOffer', () => {
        it('should call and wait for register an offer', async () => {
            await offerDriver.registerOffer(companyOwner.address, 1);

            expect(mockedRegisterOffer).toHaveBeenCalledTimes(1);
            expect(mockedRegisterOffer).toHaveBeenNthCalledWith(1, companyOwner.address, 1);
            expect(mockedWait).toHaveBeenCalledTimes(1);

            expect(mockedContract.registerOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.registerOffer).toHaveBeenNthCalledWith(1, companyOwner.address, 1);
        });

        it('should call and wait for register an offer - transaction fails', async () => {
            mockedRegisterOffer.mockRejectedValueOnce(new Error(errorMessage));

            const fn = async () => offerDriver.registerOffer(companyOwner.address, 1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register an offer - fails for companyOwner address', async () => {
            const fn = async () => offerDriver.registerOffer('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getLastId', () => {
        it('should get the last id', async () => {
            await offerDriver.getLastId();
            expect(mockedContract.getLastId).toHaveBeenCalledTimes(1);
        });

        it('should get the last id - transaction fails', async () => {
            mockedContract.getLastId = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

            const fn = async () => offerDriver.getLastId();
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('getOfferIdsByCompany', () => {
        it('should get the offers id by company', async () => {
            mockedContract.getOfferIdsByCompany = jest.fn().mockResolvedValue([BigNumber.from(1)]);
            await offerDriver.getOfferIdsByCompany(companyOwner.address);

            expect(mockedContract.getOfferIdsByCompany).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOfferIdsByCompany).toHaveBeenNthCalledWith(1, companyOwner.address);
        });

        it('should get the offers id by company - transaction fails', async () => {
            mockedContract.getOfferIdsByCompany = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.getOfferIdsByCompany(companyOwner.address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should get the offers id by company - FAIL(Not an address)', async () => {
            await expect(offerDriver.getOfferIdsByCompany('0xaddress')).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getSupplierName', () => {
        it('should get the supplier name', async () => {
            mockedContract.getSupplierName = jest.fn().mockResolvedValue(companyNames[0]);
            const resp = await offerDriver.getSupplierName(companyOwner.address);

            expect(resp).toEqual(companyNames[0]);
            expect(mockedContract.getSupplierName).toHaveBeenCalledTimes(1);
            expect(mockedContract.getSupplierName).toHaveBeenNthCalledWith(1, companyOwner.address, { blockTag: undefined });
        });

        it('should get the supplier name - transaction fails', async () => {
            mockedContract.getSupplierName = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.getSupplierName(companyOwner.address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should get the supplier name - FAIL(Not an address)', async () => {
            await expect(offerDriver.getSupplierName('0xaddress')).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOffer', () => {
        it('should retrieve an offer', async () => {
            mockedContract.getOffer = jest.fn().mockResolvedValue('rawOffer');

            const resp = await offerDriver.getOffer(1);

            expect(buildOfferSpy).toHaveBeenCalledTimes(1);
            expect(buildOfferSpy).toHaveBeenNthCalledWith(1, 'rawOffer', productCategoryStruct);
            expect(resp).toEqual(mockedOffer);

            expect(mockedContract.getOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOffer).toHaveBeenNthCalledWith(1, 1, { blockTag: undefined });
        });

        it('should retrieve an offer with block number', async () => {
            await offerDriver.getOffer(1, 15);

            expect(mockedContract.getOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOffer).toHaveBeenNthCalledWith(1, 1, { blockTag: 15 });
        });

        it('should retrieve a offer - transaction fails', async () => {
            mockedContract.getOffer = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.getOffer(1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('updateSupplier', () => {
        it('should update a supplier', async () => {
            await offerDriver.updateSupplier(companyOwner.address, companyNames[1]);

            expect(mockedContract.updateSupplier).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateSupplier).toHaveBeenNthCalledWith(1, companyOwner.address, companyNames[1]);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should update a supplier - transaction fails', async () => {
            mockedContract.updateSupplier = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.updateSupplier(companyOwner.address, companyNames[1]);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should update a supplier - fails for companyOwner address', async () => {
            const fn = async () => offerDriver.updateSupplier('0xaddress', companyNames[1]);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('updateOffer', () => {
        it('should update an offer', async () => {
            await offerDriver.updateOffer(1, 2);

            expect(mockedContract.updateOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateOffer).toHaveBeenNthCalledWith(1, 1, 2);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should update an offer - transaction fails', async () => {
            mockedContract.updateOffer = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.updateOffer(1, 2);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('deleteSupplier', () => {
        it('should delete a supplier', async () => {
            await offerDriver.deleteSupplier(companyOwner.address);

            expect(mockedContract.deleteSupplier).toHaveBeenCalledTimes(1);
            expect(mockedContract.deleteSupplier).toHaveBeenNthCalledWith(1, companyOwner.address);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should delete a supplier - transaction fails', async () => {
            mockedContract.deleteSupplier = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.deleteSupplier(companyOwner.address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('deleteOffer', () => {
        it('should delete an offer', async () => {
            await offerDriver.deleteOffer(1);

            expect(mockedContract.deleteOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.deleteOffer).toHaveBeenNthCalledWith(1, 1);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should delete an offer - transaction fails', async () => {
            mockedContract.deleteOffer = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.deleteOffer(1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('addAdmin', () => {
        it('should call and wait for add admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await offerDriver.addAdmin(address);

            expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.addAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add admin - fails for address', async () => {
            const address = '123';

            const fn = async () => offerDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('removeAdmin', () => {
        it('should call and wait for remove admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await offerDriver.removeAdmin(address);

            expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for remove admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.removeAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for remove admin - fails for address', async () => {
            const address = '123';

            const fn = async () => offerDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });
});
