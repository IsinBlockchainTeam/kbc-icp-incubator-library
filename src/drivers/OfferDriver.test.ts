/* eslint-disable camelcase */

import { BigNumber, ethers, Signer } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { OfferDriver } from './OfferDriver';
import { OfferManager, OfferManager__factory } from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Offer } from '../entities/Offer';
import { PRODUCT_CATEGORY } from '../utils/constants';

describe('OfferDriver', () => {
    let offerDriver: OfferDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';
    const categories = [PRODUCT_CATEGORY.ARABIC_85, PRODUCT_CATEGORY.EXCELSA_88];

    let mockedSigner: Signer;
    let mockedContract: OfferManager;

    const mockedOfferConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedRegisterOffer = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedReadStringFunction = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const mockedOfferRegisteredEventFilter = jest.fn();
    const mockedOfferUpdatedEventFilter = jest.fn();
    const mockedOfferDeletedEventFilter = jest.fn();

    const companyOwner = ethers.Wallet.createRandom();
    const offerName = 'offer 1';

    const buildOfferSpy = jest.spyOn(EntityBuilder, 'buildOffer');

    const mockedOffer = createMock<Offer>();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedReadStringFunction.mockResolvedValue('test');
        mockedRegisterOffer.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OfferRegistered' }] }),
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedContract = createMock<OfferManager>({
            registerOffer: mockedRegisterOffer,
            getLastId: mockedReadFunction,
            getOfferIdsByCompany: mockedReadFunction,
            getOffer: mockedReadFunction,
            updateOffer: mockedWriteFunction,
            deleteOffer: mockedWriteFunction,

            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
            filters: {
                OfferRegistered: mockedOfferRegisteredEventFilter,
                OfferUpdated: mockedOfferUpdatedEventFilter,
                OfferDeleted: mockedOfferDeletedEventFilter,
            },
        });

        mockedOfferConnect.mockReturnValue(mockedContract);
        const mockedOfferManager = createMock<OfferManager>({
            connect: mockedOfferConnect,
        });
        jest.spyOn(OfferManager__factory, 'connect').mockReturnValue(mockedOfferManager);

        buildOfferSpy.mockReturnValue(mockedOffer);

        mockedSigner = createMock<Signer>();
        offerDriver = new OfferDriver(
            mockedSigner,
            testAddress,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerOffer', () => {
        it('should call and wait for register an offer', async () => {
            await offerDriver.registerOffer(companyOwner.address, categories[0]);

            expect(mockedRegisterOffer).toHaveBeenCalledTimes(1);
            expect(mockedRegisterOffer).toHaveBeenNthCalledWith(1, companyOwner.address, categories[0]);
            expect(mockedWait).toHaveBeenCalledTimes(1);

            expect(mockedContract.registerOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.registerOffer).toHaveBeenNthCalledWith(1, companyOwner.address, categories[0]);
        });

        it('should call and wait for register an offer - transaction fails', async () => {
            mockedRegisterOffer.mockRejectedValueOnce(new Error(errorMessage));

            const fn = async () => offerDriver.registerOffer(companyOwner.address, categories[0]);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register an offer - fails for companyOwner address', async () => {
            const fn = async () => offerDriver.registerOffer('0xaddress', categories[0]);
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

    describe('getOffer', () => {
        it('should retrieve an offer', async () => {
            mockedContract.getOffer = jest.fn().mockResolvedValue('rawOffer');

            const resp = await offerDriver.getOffer(1);

            expect(buildOfferSpy).toHaveBeenCalledTimes(1);
            expect(buildOfferSpy).toHaveBeenNthCalledWith(1, 'rawOffer');
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

    describe('updateOffer', () => {
        it('should update an offer', async () => {
            await offerDriver.updateOffer(1, categories[1]);

            expect(mockedContract.updateOffer).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateOffer).toHaveBeenNthCalledWith(1, 1, categories[1]);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should update an offer - transaction fails', async () => {
            mockedContract.updateOffer = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => offerDriver.updateOffer(1, categories[1]);
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
