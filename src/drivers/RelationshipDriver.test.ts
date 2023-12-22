import { createMock } from 'ts-auto-mock';
import { BigNumber, ethers, Signer } from 'ethers';
import { RelationshipManager, RelationshipManager__factory } from '../smart-contracts';
import { RelationshipDriver } from './RelationshipDriver';
import { Relationship } from '../entities/Relationship';
import { EntityBuilder } from '../utils/EntityBuilder';

describe('RelationshipDriver', () => {
    let relationshipDriver: RelationshipDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedSigner: Signer;
    let mockedContract: RelationshipManager;

    const mockedRelationshipConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedRegisterRelationship = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const companyA = ethers.Wallet.createRandom();
    const companyB = ethers.Wallet.createRandom();
    const now = new Date();
    const mockedRelationship = createMock<Relationship>();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedRegisterRelationship.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'RelationshipRegistered' }] }),
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedContract = createMock<RelationshipManager>({
            registerRelationship: mockedRegisterRelationship,
            getRelationshipInfo: mockedReadFunction,
            getRelationshipCounter: mockedReadFunction,
            getRelationshipIdsByCompany: mockedReadFunction,
            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
        });

        mockedRelationshipConnect.mockReturnValue(mockedContract);
        const mockedRelationshipManager = createMock<RelationshipManager>({
            connect: mockedRelationshipConnect,
        });
        jest.spyOn(RelationshipManager__factory, 'connect').mockReturnValue(mockedRelationshipManager);

        const buildRelationshipSpy = jest.spyOn(EntityBuilder, 'buildRelationship');
        buildRelationshipSpy.mockReturnValue(mockedRelationship);

        mockedSigner = createMock<Signer>();
        relationshipDriver = new RelationshipDriver(
            mockedSigner,
            testAddress,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerRelationship', () => {
        it('should call and wait for register relationship', async () => {
            await relationshipDriver.registerRelationship(companyA.address, companyB.address, now, new Date('2030-10-10'));

            expect(mockedRegisterRelationship).toHaveBeenCalledTimes(1);
            expect(mockedRegisterRelationship).toHaveBeenNthCalledWith(
                1,
                companyA.address,
                companyB.address,
                now.getTime(),
                new Date('2030-10-10').getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register relationship without validUntil date', async () => {
            await relationshipDriver.registerRelationship(companyA.address, companyB.address, now);

            expect(mockedRegisterRelationship).toHaveBeenCalledTimes(1);
            expect(mockedRegisterRelationship).toHaveBeenNthCalledWith(
                1,
                companyA.address,
                companyB.address,
                now.getTime(),
                0,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register relationship - transaction fails', async () => {
            mockedRegisterRelationship.mockRejectedValue(new Error(errorMessage));

            const fn = async () => relationshipDriver.registerRelationship(companyA.address, companyB.address, now);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register relationship - FAIL (Company A not an address)', async () => {
            const fn = async () => relationshipDriver.registerRelationship('0xaddress', companyB.address, now);
            await expect(fn).rejects.toThrowError(new Error('Company A not an address'));
        });

        it('should call and wait for register relationship - FAIL (Company B not an address)', async () => {
            const fn = async () => relationshipDriver.registerRelationship(companyA.address, '0xaddress', now);
            await expect(fn).rejects.toThrowError(new Error('Company B not an address'));
        });
    });

    describe('getRelationshipCounter', () => {
        it('should get the relationship counter ids', async () => {
            await relationshipDriver.getRelationshipCounter();
            expect(mockedContract.getRelationshipCounter).toHaveBeenCalledTimes(1);
        });

        it('should get the relationship counter ids - transaction fails', async () => {
            mockedContract.getRelationshipCounter = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => relationshipDriver.getRelationshipCounter();
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('getRelationshipInfo', () => {
        it('should retrieve relationship', async () => {
            mockedContract.getRelationshipInfo = jest.fn().mockResolvedValue(mockedRelationship);

            const resp = await relationshipDriver.getRelationshipInfo(1);

            expect(resp).toEqual(mockedRelationship);

            expect(mockedContract.getRelationshipInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getRelationshipInfo).toHaveBeenNthCalledWith(
                1,
                1,
            );
        });

        it('should retrieve relationship - transaction fails', async () => {
            mockedContract.getRelationshipInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => relationshipDriver.getRelationshipInfo(1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('getRelationshipIdsByCompany', () => {
        it('should retrieve relationship ids by company address', async () => {
            mockedContract.getRelationshipIdsByCompany = jest.fn().mockResolvedValue([{ toNumber: () => 1 }, { toNumber: () => 2 }]);

            const resp = await relationshipDriver.getRelationshipIdsByCompany(companyB.address);
            expect(resp).toEqual([1, 2]);
            expect(mockedContract.getRelationshipIdsByCompany).toHaveBeenCalledTimes(1);
            expect(mockedContract.getRelationshipIdsByCompany).toHaveBeenNthCalledWith(1, companyB.address);
        });

        it('should retrieve relationship ids by company address - transaction fails', async () => {
            mockedContract.getRelationshipIdsByCompany = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => relationshipDriver.getRelationshipIdsByCompany(companyB.address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('addAdmin', () => {
        it('should call and wait for add admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await relationshipDriver.addAdmin(address);

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

            const fn = async () => relationshipDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add admin - fails for address', async () => {
            const address = '123';

            const fn = async () => relationshipDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('removeAdmin', () => {
        it('should call and wait for remove admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await relationshipDriver.removeAdmin(address);

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

            const fn = async () => relationshipDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for remove admin - fails for address', async () => {
            const address = '123';

            const fn = async () => relationshipDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });
});
