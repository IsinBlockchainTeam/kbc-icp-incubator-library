/* eslint-disable camelcase */

describe('SupplyChainDriver', () => {
    // let supplyChainDriver: SupplyChainDriver;
    // const companyAddress: string = Wallet.createRandom().address;
    // const contractAddress: string = Wallet.createRandom().address;
    //
    // let mockedSigner: Signer;
    //
    // const mockedSupplyChainManagerConnect = jest.fn();
    // const mockedWait = jest.fn();
    // const mockedToNumber = jest.fn();
    //
    // const mockedWriteFunction = jest.fn();
    // const mockedReadFunction = jest.fn();
    // const mockedGetMaterial = jest.fn();
    // const mockedGetTrade = jest.fn();
    // const mockedGetTransformation = jest.fn();
    //
    // const mockedMaterialStructOutput = createMock<MaterialStructOutput>();
    // const mockedTradeStructOutput = createMock<TradeStructOutput>();
    // const mockedTransformationStructOutput = createMock<TransformationStructOutput>();
    // const mockedMaterial = createMock<Material>();
    // const mockedTrade = createMock<Trade>();
    // const mockedTransformation = createMock<Transformation>();
    //
    // mockedWriteFunction.mockResolvedValue({
    //     wait: mockedWait,
    // });
    // mockedReadFunction.mockResolvedValue({
    //     toNumber: mockedToNumber,
    // });
    // mockedGetMaterial.mockReturnValue(Promise.resolve(mockedMaterialStructOutput));
    // mockedGetTrade.mockReturnValue(Promise.resolve(mockedTradeStructOutput));
    // mockedGetTransformation.mockReturnValue(Promise.resolve(mockedTransformationStructOutput));
    //
    // const mockedContract = createMock<SupplyChainManager>({
    //     registerMaterial: mockedWriteFunction,
    //     registerTrade: mockedWriteFunction,
    //     registerTransformation: mockedWriteFunction,
    //     updateMaterial: mockedWriteFunction,
    //     updateTrade: mockedWriteFunction,
    //     updateTransformation: mockedWriteFunction,
    //     getMaterialsCounter: mockedReadFunction,
    //     getTradesCounter: mockedReadFunction,
    //     getTransformationsCounter: mockedReadFunction,
    //     getMaterial: mockedGetMaterial,
    //     getTrade: mockedGetTrade,
    //     getTransformation: mockedGetTransformation,
    // });
    //
    // beforeAll(() => {
    //     mockedToNumber.mockReturnValue(1);
    //
    //     mockedSupplyChainManagerConnect.mockReturnValue(mockedContract);
    //     const mockedSupplyChainManager = createMock<SupplyChainManager>({
    //         connect: mockedSupplyChainManagerConnect,
    //     });
    //     jest.spyOn(SupplyChainManager__factory, 'connect').mockReturnValue(mockedSupplyChainManager);
    //     const buildMaterialSpy = jest.spyOn(EntityBuilder, 'buildMaterial');
    //     buildMaterialSpy.mockReturnValue(mockedMaterial);
    //     const buildTradeSpy = jest.spyOn(EntityBuilder, 'buildBasicTrade');
    //     buildTradeSpy.mockReturnValue(mockedTrade);
    //     const buildTransformationSpy = jest.spyOn(EntityBuilder, 'buildTransformation');
    //     buildTransformationSpy.mockReturnValue(mockedTransformation);
    //
    //     mockedSigner = createMock<Signer>();
    //     supplyChainDriver = new SupplyChainDriver(mockedSigner, contractAddress);
    // });
    //
    // afterAll(() => {
    //     jest.restoreAllMocks();
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.registerMaterial(companyAddress, 'material'),
    //         mockedRegister: mockedContract.registerMaterial,
    //         mockedRegisterArgs: [companyAddress, 'material'],
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.registerTrade(companyAddress, 'trade', [[1, 2]]),
    //         mockedRegister: mockedContract.registerTrade,
    //         mockedRegisterArgs: [companyAddress, 'trade', [[1, 2]]],
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.registerTransformation(companyAddress, 'transformation', [1, 2], 3),
    //         mockedRegister: mockedContract.registerTransformation,
    //         mockedRegisterArgs: [companyAddress, 'transformation', [1, 2], 3],
    //     },
    // ])('should correctly register a new $resource', async ({ resource, method, mockedRegister, mockedRegisterArgs }) => {
    //     await method();
    //
    //     expect(mockedRegister).toHaveBeenCalledTimes(1);
    //     expect(mockedRegister).toHaveBeenNthCalledWith(1, ...mockedRegisterArgs);
    //
    //     expect(mockedWait).toHaveBeenCalledTimes(1);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.registerMaterial('notAnAddress', 'material'),
    //         mockedRegister: mockedContract.registerMaterial,
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.registerTrade('notAnAddress', 'trade', [[1, 2]]),
    //         mockedRegister: mockedContract.registerTrade,
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.registerTransformation('notAnAddress', 'transformation', [1, 2], 3),
    //         mockedRegister: mockedContract.registerTransformation,
    //     },
    // ])('should not register a new $resource - not an address', async ({ resource, method, mockedRegister }) => {
    //     await expect(method()).rejects.toThrow(new Error('Not an address'));
    //
    //     expect(mockedRegister).toHaveBeenCalledTimes(0);
    //     expect(mockedWait).toHaveBeenCalledTimes(0);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.updateMaterial(companyAddress, 0, 'material'),
    //         mockedUpdate: mockedContract.updateMaterial,
    //         mockedUpdateArgs: [companyAddress, 0, 'material'],
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.updateTrade(companyAddress, 0, 'trade', [[1, 2]]),
    //         mockedUpdate: mockedContract.updateTrade,
    //         mockedUpdateArgs: [companyAddress, 0, 'trade', [[1, 2]]],
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.updateTransformation(companyAddress, 0, 'transformation', [1, 2], 3),
    //         mockedUpdate: mockedContract.updateTransformation,
    //         mockedUpdateArgs: [companyAddress, 0, 'transformation', [1, 2], 3],
    //     },
    // ])('should correctly update a $resource', async ({ resource, method, mockedUpdate, mockedUpdateArgs }) => {
    //     await method();
    //
    //     expect(mockedUpdate).toHaveBeenCalledTimes(1);
    //     expect(mockedUpdate).toHaveBeenNthCalledWith(1, ...mockedUpdateArgs);
    //
    //     expect(mockedWait).toHaveBeenCalledTimes(1);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.updateMaterial('notAnAddress', 0, 'material'),
    //         mockedUpdate: mockedContract.updateMaterial,
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.updateTrade('notAnAddress', 0, 'trade', [[1, 2]]),
    //         mockedUpdate: mockedContract.updateTrade,
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.updateTransformation('notAnAddress', 0, 'transformation', [1, 2], 3),
    //         mockedUpdate: mockedContract.updateTransformation,
    //     },
    // ])('should not update a $resource - not an address', async ({ resource, method, mockedUpdate }) => {
    //     await expect(method()).rejects.toThrow(new Error('Not an address'));
    //
    //     expect(mockedUpdate).toHaveBeenCalledTimes(0);
    //     expect(mockedWait).toHaveBeenCalledTimes(0);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.getMaterialsCounter(companyAddress),
    //         mockedGetCounter: mockedContract.getMaterialsCounter,
    //         mockedGetCounterArgs: [companyAddress],
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.getTradesCounter(companyAddress),
    //         mockedGetCounter: mockedContract.getTradesCounter,
    //         mockedGetCounterArgs: [companyAddress],
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.getTransformationsCounter(companyAddress),
    //         mockedGetCounter: mockedContract.getTransformationsCounter,
    //         mockedGetCounterArgs: [companyAddress],
    //     },
    // ])('should correctly retrieve $resource counter', async ({ resource, method, mockedGetCounter, mockedGetCounterArgs }) => {
    //     const response = await method();
    //
    //     expect(response).toEqual(1);
    //
    //     expect(mockedGetCounter).toHaveBeenCalledTimes(1);
    //     expect(mockedGetCounter).toHaveBeenNthCalledWith(1, ...mockedGetCounterArgs);
    //     expect(mockedToNumber).toHaveBeenCalledTimes(1);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.getMaterialsCounter('notAnAddress'),
    //         mockedGetCounter: mockedContract.getMaterialsCounter,
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.getTradesCounter('notAnAddress'),
    //         mockedGetCounter: mockedContract.getTradesCounter,
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.getTransformationsCounter('notAnAddress'),
    //         mockedGetCounter: mockedContract.getTransformationsCounter,
    //     },
    // ])('should not retrieve $resource counter - not an address', async ({ resource, method, mockedGetCounter }) => {
    //     await expect(method()).rejects.toThrow(new Error('Not an address'));
    //
    //     expect(mockedGetCounter).toHaveBeenCalledTimes(0);
    //     expect(mockedToNumber).toHaveBeenCalledTimes(0);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.getMaterial(companyAddress, 1),
    //         mockedGet: mockedGetMaterial,
    //         mockedGetArgs: [companyAddress, 1],
    //         mockedResource: mockedMaterial,
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.getTrade(companyAddress, 1),
    //         mockedGet: mockedGetTrade,
    //         mockedGetArgs: [companyAddress, 1],
    //         mockedResource: mockedTrade,
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.getTransformation(companyAddress, 1),
    //         mockedGet: mockedGetTransformation,
    //         mockedGetArgs: [companyAddress, 1],
    //         mockedResource: mockedTransformation,
    //     },
    // ])('should correctly retrieve $resource', async ({ resource, method, mockedGet, mockedGetArgs, mockedResource }) => {
    //     const response = await method();
    //
    //     expect(response).toEqual(mockedResource);
    //
    //     expect(mockedGet).toHaveBeenCalledTimes(1);
    //     expect(mockedGet).toHaveBeenNthCalledWith(1, ...mockedGetArgs);
    // });
    //
    // it.each([
    //     {
    //         resource: 'Material',
    //         method: () => supplyChainDriver.getMaterial('notAnAddress', 1),
    //         mockedGet: mockedGetMaterial,
    //     },
    //     {
    //         resource: 'Trade',
    //         method: () => supplyChainDriver.getTrade('notAnAddress', 1),
    //         mockedGet: mockedGetTrade,
    //     },
    //     {
    //         resource: 'Transformation',
    //         method: () => supplyChainDriver.getTransformation('notAnAddress', 1),
    //         mockedGet: mockedGetTransformation,
    //     },
    // ])('should not retrieve $resource - not an address', async ({ resource, method, mockedGet }) => {
    //     await expect(method()).rejects.toThrow(new Error('Not an address'));
    //
    //     expect(mockedGet).toHaveBeenCalledTimes(0);
    // });
});
