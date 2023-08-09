// /* eslint-disable camelcase */
// import { JsonRpcProvider } from '@ethersproject/providers';
// import { createMock } from 'ts-auto-mock';
// import { IdentityEthersDriver } from '@blockchain-lib/common';
// import { BigNumber, ethers } from 'ethers';
// import { RelationshipManager, RelationshipManager__factory } from '../smart-contracts';
// import { RelationshipDriver } from './RelationshipDriver';
// import { Relationship } from '../entities/Relationship';
//
// describe('RelationshipDriver', () => {
//     let relationshipDriver: RelationshipDriver;
//
//     const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
//     const errorMessage = 'testError';
//
//     let mockedIdentityDriver: IdentityEthersDriver;
//     let mockedProvider: JsonRpcProvider;
//
//     const mockedRelationshipConnect = jest.fn();
//     const mockedWait = jest.fn();
//     const mockedToNumber = jest.fn();
//     const mockedRegisterRelationship = jest.fn();
//     const mockedGetRelationshipInfo = jest.fn();
//     const mockedGetRelationshipCounter = jest.fn();
//     const mockedGetRelationshipIdsByCompany = jest.fn();
//     const mockedAddAdmin = jest.fn();
//     const mockedRemoveAdmin = jest.fn();
//     const mockedDecodeEventLog = jest.fn();
//
//     const companyA = ethers.Wallet.createRandom();
//     const companyB = ethers.Wallet.createRandom();
//     const now = new Date();
//
//     beforeAll(() => {
//         mockedRegisterRelationship.mockReturnValue(Promise.resolve({
//             wait: mockedWait.mockReturnValue({ events: [{ event: 'RelationshipRegistered' }] }),
//         }));
//         mockedGetRelationshipCounter.mockReturnValue(Promise.resolve({
//             toNumber: mockedToNumber,
//         }));
//         mockedGetRelationshipIdsByCompany.mockReturnValue(Promise.resolve({
//             wait: mockedWait,
//         }));
//         mockedAddAdmin.mockReturnValue(Promise.resolve({
//             wait: mockedWait,
//         }));
//         mockedRemoveAdmin.mockReturnValue(Promise.resolve({
//             wait: mockedWait,
//         }));
//         mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });
//
//         mockedRelationshipConnect.mockReturnValue({
//             registerRelationship: mockedRegisterRelationship,
//             getRelationshipInfo: mockedGetRelationshipInfo,
//             getRelationshipCounter: mockedGetRelationshipCounter,
//             getRelationshipIdsByCompany: mockedGetRelationshipIdsByCompany,
//             addAdmin: mockedAddAdmin,
//             removeAdmin: mockedRemoveAdmin,
//             interface: { decodeEventLog: mockedDecodeEventLog },
//         });
//         const mockedRelationshipManager = createMock<RelationshipManager>({
//             connect: mockedRelationshipConnect,
//         });
//         jest.spyOn(RelationshipManager__factory, 'connect').mockReturnValue(mockedRelationshipManager);
//
//         mockedIdentityDriver = createMock<IdentityEthersDriver>();
//         mockedProvider = createMock<JsonRpcProvider>({
//             _isProvider: true,
//         });
//         relationshipDriver = new RelationshipDriver(
//             mockedIdentityDriver,
//             mockedProvider,
//             testAddress,
//         );
//     });
//
//     afterAll(() => {
//         jest.restoreAllMocks();
//     });
//
//     it('should call and wait for register relationship', async () => {
//         await relationshipDriver.registerRelationship(companyA.address, companyB.address, now, new Date('2030-10-10'));
//
//         expect(mockedRegisterRelationship).toHaveBeenCalledTimes(1);
//         expect(mockedRegisterRelationship).toHaveBeenNthCalledWith(
//             1,
//             companyA.address,
//             companyB.address,
//             now.getTime(),
//             new Date('2030-10-10').getTime(),
//         );
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should call and wait for register relationship without validUntil date', async () => {
//         await relationshipDriver.registerRelationship(companyA.address, companyB.address, now);
//
//         expect(mockedRegisterRelationship).toHaveBeenCalledTimes(1);
//         expect(mockedRegisterRelationship).toHaveBeenNthCalledWith(
//             1,
//             companyA.address,
//             companyB.address,
//             now.getTime(),
//             0,
//         );
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should call and wait for register relationship - transaction fails', async () => {
//         mockedRegisterRelationship.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.registerRelationship(companyA.address, companyB.address, now);
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should call and wait for register relationship - FAIL (Company A not an address)', async () => {
//         const fn = async () => relationshipDriver.registerRelationship('0xaddress', companyB.address, now);
//         await expect(fn).rejects.toThrowError(new Error('Company A not an address'));
//     });
//
//     it('should call and wait for register relationship - FAIL (Company B not an address)', async () => {
//         const fn = async () => relationshipDriver.registerRelationship(companyA.address, '0xaddress', now);
//         await expect(fn).rejects.toThrowError(new Error('Company B not an address'));
//     });
//
//     it('should get the relationship counter ids', async () => {
//         await relationshipDriver.getRelationshipCounter();
//         expect(mockedGetRelationshipCounter).toHaveBeenCalledTimes(1);
//     });
//
//     it('should get the relationship counter ids - transaction fails', async () => {
//         mockedGetRelationshipCounter.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.getRelationshipCounter();
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should retrieve relationship', async () => {
//         const relationship = new Relationship(1, companyA.address, companyB.address, now, new Date('2030-10-10'));
//         mockedGetRelationshipInfo.mockResolvedValue({
//             companyA: relationship.companyA,
//             companyB: relationship.companyB,
//             validFrom: { toNumber: () => relationship.validFrom },
//             validUntil: { isZero: () => false, toNumber: () => relationship.validUntil },
//         });
//
//         const resp = await relationshipDriver.getRelationshipInfo(1);
//
//         expect(resp).toEqual(relationship);
//
//         expect(mockedGetRelationshipInfo).toHaveBeenCalledTimes(1);
//         expect(mockedGetRelationshipInfo).toHaveBeenNthCalledWith(
//             1,
//             1,
//         );
//     });
//
//     it('should retrieve relationship - transaction fails', async () => {
//         mockedGetRelationshipInfo.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.getRelationshipInfo(1);
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should retrieve relationship ids by company address', async () => {
//         mockedGetRelationshipIdsByCompany.mockResolvedValue([{ toNumber: () => 1 }, { toNumber: () => 2 }]);
//
//         const resp = await relationshipDriver.getRelationshipIdsByCompany(companyB.address);
//         expect(resp).toEqual([1, 2]);
//         expect(mockedGetRelationshipIdsByCompany).toHaveBeenCalledTimes(1);
//         expect(mockedGetRelationshipIdsByCompany).toHaveBeenNthCalledWith(1, companyB.address);
//     });
//
//     it('should retrieve relationship ids by company address - transaction fails', async () => {
//         mockedGetRelationshipIdsByCompany.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.getRelationshipIdsByCompany(companyB.address);
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should call and wait for add admin', async () => {
//         const { address } = ethers.Wallet.createRandom();
//         await relationshipDriver.addAdmin(address);
//
//         expect(mockedAddAdmin).toHaveBeenCalledTimes(1);
//         expect(mockedAddAdmin).toHaveBeenNthCalledWith(
//             1,
//             address,
//         );
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should call and wait for add admin - transaction fails', async () => {
//         const { address } = ethers.Wallet.createRandom();
//         mockedAddAdmin.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.addAdmin(address);
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should call and wait for add admin - fails for address', async () => {
//         const address = '123';
//
//         const fn = async () => relationshipDriver.addAdmin(address);
//         await expect(fn).rejects.toThrowError(new Error('Not an address'));
//     });
//
//     it('should call and wait for remove admin', async () => {
//         const { address } = ethers.Wallet.createRandom();
//         await relationshipDriver.removeAdmin(address);
//
//         expect(mockedRemoveAdmin).toHaveBeenCalledTimes(1);
//         expect(mockedRemoveAdmin).toHaveBeenNthCalledWith(
//             1,
//             address,
//         );
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should call and wait for remove admin - transaction fails', async () => {
//         const { address } = ethers.Wallet.createRandom();
//         mockedRemoveAdmin.mockRejectedValue(new Error(errorMessage));
//
//         const fn = async () => relationshipDriver.removeAdmin(address);
//         await expect(fn).rejects.toThrowError(new Error(errorMessage));
//     });
//
//     it('should call and wait for remove admin - fails for address', async () => {
//         const address = '123';
//
//         const fn = async () => relationshipDriver.removeAdmin(address);
//         await expect(fn).rejects.toThrowError(new Error('Not an address'));
//     });
// });
