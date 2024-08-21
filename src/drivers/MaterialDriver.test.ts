// import { BigNumber, Signer, Wallet } from 'ethers';
// import { createMock } from 'ts-auto-mock';
// import { MaterialDriver } from './MaterialDriver';
// import { EntityBuilder } from '../utils/EntityBuilder';
// import {
//     MaterialManager,
//     MaterialManager__factory,
//     ProductCategoryManager,
//     ProductCategoryManager__factory
// } from '../smart-contracts';
// import { Material } from '../entities/Material';
//
// describe('MaterialDriver', () => {
//     let materialDriver: MaterialDriver;
//     const companyAddress: string = Wallet.createRandom().address;
//     const contractAddress: string = Wallet.createRandom().address;
//
//     let mockedSigner: Signer;
//
//     const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
//         id: BigNumber.from(2),
//         name: 'category1',
//         quality: 85,
//         description: 'description',
//         exists: true
//     } as ProductCategoryManager.ProductCategoryStructOutput;
//
//     const mockedMaterialManagerConnect = jest.fn();
//     const mockedProductCategoryManagerConnect = jest.fn();
//     const mockedWait = jest.fn();
//     const mockedToNumber = jest.fn();
//
//     const mockedWriteFunction = jest.fn();
//     const mockedReadFunction = jest.fn();
//     const mockedGetMaterial = jest.fn();
//     const mockedGetMaterialExists = jest.fn();
//     const mockedGetMaterialIdsOfCreator = jest.fn();
//
//     const mockedMaterialStructOutput = createMock<MaterialManager.MaterialStructOutput>();
//     const mockedMaterial = createMock<Material>();
//     const mockedGetProductCategory = jest.fn();
//
//     mockedWriteFunction.mockResolvedValue({
//         wait: mockedWait
//     });
//     mockedReadFunction.mockResolvedValue({
//         toNumber: mockedToNumber
//     });
//     mockedGetMaterial.mockReturnValue(Promise.resolve(mockedMaterialStructOutput));
//     mockedGetMaterialExists.mockReturnValue(true);
//     mockedGetMaterialIdsOfCreator.mockReturnValue([BigNumber.from(1)]);
//
//     mockedGetProductCategory.mockReturnValue(productCategoryStruct);
//
//     const mockedContract = createMock<MaterialManager>({
//         getMaterialsCounter: mockedReadFunction,
//         getMaterialExists: mockedGetMaterialExists,
//         getMaterial: mockedGetMaterial,
//         getMaterialIdsOfCreator: mockedGetMaterialIdsOfCreator,
//         registerMaterial: mockedWriteFunction,
//         updateMaterial: mockedWriteFunction
//     });
//
//     const mockedProductCategoryContract = createMock<ProductCategoryManager>({
//         getProductCategory: mockedGetProductCategory
//     });
//
//     beforeAll(() => {
//         mockedToNumber.mockReturnValue(1);
//
//         mockedMaterialManagerConnect.mockReturnValue(mockedContract);
//         const mockedMaterialManager = createMock<MaterialManager>({
//             connect: mockedMaterialManagerConnect
//         });
//         mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
//         const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
//             connect: mockedProductCategoryManagerConnect
//         });
//
//         jest.spyOn(MaterialManager__factory, 'connect').mockReturnValue(mockedMaterialManager);
//         jest.spyOn(ProductCategoryManager__factory, 'connect').mockReturnValue(
//             mockedProductCategoryManagerContract
//         );
//
//         const buildMaterialSpy = jest.spyOn(EntityBuilder, 'buildMaterial');
//         buildMaterialSpy.mockReturnValue(mockedMaterial);
//
//         mockedSigner = createMock<Signer>();
//         materialDriver = new MaterialDriver(
//             mockedSigner,
//             contractAddress,
//             Wallet.createRandom().address
//         );
//     });
//
//     afterAll(() => {
//         jest.restoreAllMocks();
//     });
//
//     it('should correctly register a new Material', async () => {
//         mockedWait.mockResolvedValueOnce({
//             events: [
//                 {
//                     event: 'MaterialRegistered',
//                     args: {
//                         id: BigNumber.from(productCategoryStruct.id)
//                     }
//                 }
//             ]
//         });
//         await materialDriver.registerMaterial(productCategoryStruct.id.toNumber());
//
//         expect(mockedContract.registerMaterial).toHaveBeenCalledTimes(1);
//         expect(mockedContract.registerMaterial).toHaveBeenNthCalledWith(
//             1,
//             productCategoryStruct.id.toNumber()
//         );
//
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly register a new Material - FAIL(Error during material registration, no events found)', async () => {
//         mockedWait.mockResolvedValueOnce({
//             events: undefined
//         });
//         await expect(
//             materialDriver.registerMaterial(productCategoryStruct.id.toNumber())
//         ).rejects.toThrow('Error during material registration, no events found');
//     });
//
//     it('should correctly update a Material', async () => {
//         await materialDriver.updateMaterial(1, 10);
//
//         expect(mockedContract.updateMaterial).toHaveBeenCalledTimes(1);
//         expect(mockedContract.updateMaterial).toHaveBeenNthCalledWith(1, 1, 10);
//
//         expect(mockedWait).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly retrieve a Material counter', async () => {
//         const response: number = await materialDriver.getMaterialsCounter();
//
//         expect(response).toEqual(1);
//
//         expect(mockedContract.getMaterialsCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getMaterialsCounter).toHaveBeenNthCalledWith(1);
//         expect(mockedToNumber).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly retrieve Material ids of creator', async () => {
//         const response: Material[] = await materialDriver.getMaterialsOfCreator(companyAddress);
//
//         expect(response).toEqual([
//             EntityBuilder.buildMaterial(mockedMaterialStructOutput, productCategoryStruct)
//         ]);
//
//         expect(mockedContract.getMaterialIdsOfCreator).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getMaterialIdsOfCreator).toHaveBeenNthCalledWith(1, companyAddress);
//     });
//
//     it('should check if a Material exists', async () => {
//         const response: boolean = await materialDriver.getMaterialExists(1);
//
//         expect(response).toEqual(true);
//
//         expect(mockedContract.getMaterialExists).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getMaterialExists).toHaveBeenNthCalledWith(1, 1);
//     });
//
//     it('should correctly retrieve a Material', async () => {
//         const response: Material = await materialDriver.getMaterial(1);
//
//         expect(response).toEqual(mockedMaterial);
//
//         expect(mockedGetMaterial).toHaveBeenCalledTimes(1);
//         expect(mockedGetMaterial).toHaveBeenNthCalledWith(1, 1);
//     });
//
//     it('should correctly retrieve all Materials', async () => {
//         const response: Material[] = await materialDriver.getMaterials();
//
//         expect(response).toEqual([mockedMaterial]);
//
//         expect(mockedContract.getMaterialsCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getMaterialsCounter).toHaveBeenNthCalledWith(1);
//     });
// });
