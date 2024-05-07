import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from './BasicTradeDriver';
import { Trade as TradeContract } from '../smart-contracts/contracts/BasicTrade';
import {
    BasicTrade as BasicTradeContract,
    Trade__factory,
    BasicTrade__factory,
    MaterialManager,
    ProductCategoryManager,
    MaterialManager__factory,
    ProductCategoryManager__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Line, LineRequest } from '../entities/Trade';

describe('BasicTradeDriver', () => {
    let basicTradeDriver: BasicTradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const tradeId: number = 1;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'externalUrl';
    const line: TradeContract.LineStructOutput = {
        id: BigNumber.from(0),
        materialId: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        exists: true,
    } as TradeContract.LineStructOutput;
    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        exists: true,
    } as MaterialManager.MaterialStructOutput;
    const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
        id: BigNumber.from(2),
        name: 'category1',
        quality: 85,
        description: 'description',
        exists: true,
    } as ProductCategoryManager.ProductCategoryStructOutput;
    const lineIds: BigNumber[] = [BigNumber.from(line.id)];
    const name: string = 'test trade';

    let mockedSigner: Signer;

    const mockedBasicTradeConnect = jest.fn();
    const mockedMaterialManagerConnect = jest.fn();
    const mockedProductCategoryManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedUpdateLine = jest.fn();
    const mockedAssignMaterial = jest.fn();
    const mockedGetLineCounter = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetLine = jest.fn();

    const mockedGetMaterial = jest.fn();
    const mockedGetProductCategory = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedUpdateLine.mockResolvedValue({
        wait: mockedWait,
    });
    mockedAssignMaterial.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrade.mockResolvedValue(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds, name],
    );
    mockedGetLineCounter.mockResolvedValue(BigNumber.from(1));
    mockedGetLine.mockResolvedValue(line);

    mockedGetMaterial.mockReturnValue(materialStruct);
    mockedGetProductCategory.mockReturnValue(productCategoryStruct);

    const mockedContract = createMock<BasicTradeContract>({
        getLineCounter: mockedGetLineCounter,
        getTrade: mockedGetTrade,
        getLine: mockedGetLine,
        addLine: mockedWriteFunction,
        updateLine: mockedUpdateLine,
        assignMaterial: mockedAssignMaterial,
        setName: mockedWriteFunction,
    });

    const mockedMaterialContract = createMock<MaterialManager>({
        getMaterial: mockedGetMaterial,
    });
    const mockedProductCategoryContract = createMock<ProductCategoryManager>({
        getProductCategory: mockedGetProductCategory,
    });

    beforeAll(() => {
        mockedBasicTradeConnect.mockReturnValue(mockedContract);
        const mockedBasicTradeContract = createMock<BasicTradeContract>({
            connect: mockedBasicTradeConnect,
        });
        mockedMaterialManagerConnect.mockReturnValue(mockedMaterialContract);
        const mockedMaterialManagerContract = createMock<MaterialManager>({
            connect: mockedMaterialManagerConnect,
        });
        mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
        const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect,
        });

        jest.spyOn(Trade__factory, 'connect')
            .mockReturnValue(mockedBasicTradeContract);
        jest.spyOn(BasicTrade__factory, 'connect')
            .mockReturnValue(mockedBasicTradeContract);
        jest.spyOn(MaterialManager__factory, 'connect')
            .mockReturnValue(mockedMaterialManagerContract);
        jest.spyOn(ProductCategoryManager__factory, 'connect')
            .mockReturnValue(mockedProductCategoryManagerContract);

        mockedSigner = createMock<Signer>();
        basicTradeDriver = new BasicTradeDriver(mockedSigner, contractAddress, Wallet.createRandom().address, Wallet.createRandom().address);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve the basic trade', async () => {
        const result = await basicTradeDriver.getTrade();

        expect(mockedGetMaterial)
            .toHaveBeenCalledTimes(1);

        expect(result.tradeId)
            .toEqual(tradeId);
        expect(result.supplier)
            .toEqual(supplier);
        expect(result.customer)
            .toEqual(customer);
        expect(result.commissioner)
            .toEqual(commissioner);
        expect(result.externalUrl)
            .toEqual(externalUrl);
        expect(result.lines)
            .toEqual([EntityBuilder.buildTradeLine(line, productCategoryStruct, materialStruct)]);
        expect(result.name)
            .toEqual(name);

        expect(mockedContract.getTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade)
            .toHaveBeenNthCalledWith(1, { blockTag: undefined });
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetLineCounter)
            .toHaveBeenCalledTimes(1);
    });

    it('should call getLine the number of time specified by the counter', async () => {
        mockedGetLineCounter.mockResolvedValueOnce(BigNumber.from(10));

        await basicTradeDriver.getLines();
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(10);
    });

    it('should correctly retrieve a line', async () => {
        const result = await basicTradeDriver.getLine(line.id.toNumber());

        expect(result.id)
            .toEqual(line.id.toNumber());
        expect(result.material)
            .toEqual(EntityBuilder.buildMaterial(materialStruct, productCategoryStruct));
        expect(result.productCategory)
            .toEqual(EntityBuilder.buildProductCategory(productCategoryStruct));

        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add a new line', async () => {
        mockedGetMaterial.mockReturnValueOnce(undefined);
        mockedWait.mockResolvedValueOnce({
            events: [{
                event: 'TradeLineAdded',
                args: [line.id],
            }],
        });
        const newLine: LineRequest = new LineRequest(productCategoryStruct.id.toNumber());
        // TODO fix this test

        // const result: Line = await basicTradeDriver.addLine(newLine);
        //
        // expect(result).toEqual(new Line(line.id.toNumber(), undefined, EntityBuilder.buildProductCategory(productCategoryStruct)));
        // expect(mockedContract.addLine)
        //     .toHaveBeenCalledTimes(1);
        // expect(mockedContract.addLine)
        //     .toHaveBeenNthCalledWith(1, newLine.productCategoryId);
        // expect(mockedWait)
        //     .toHaveBeenCalledTimes(1);
        // expect(mockedContract.getLine)
        //     .toHaveBeenCalledTimes(1);
        // expect(mockedContract.getLine)
        //     .toHaveBeenNthCalledWith(1, line.id, { blockTag: undefined });
        // expect(mockedGetLine)
        //     .toHaveBeenCalledTimes(1);
    });

    it('should update an existing line', async () => {
        const updatedLineStruct: TradeContract.LineStructOutput = {
            id: BigNumber.from(0),
            productCategoryId: BigNumber.from(2),
            materialId: BigNumber.from(1),
            exists: true,
        } as TradeContract.LineStructOutput;
        const updatedLine: Line = EntityBuilder.buildTradeLine(updatedLineStruct, productCategoryStruct, materialStruct);
        mockedGetLine.mockResolvedValueOnce(updatedLineStruct);

        expect(await basicTradeDriver.updateLine(updatedLine)).toEqual(updatedLine);
        expect(mockedContract.updateLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateLine)
            .toHaveBeenNthCalledWith(1, updatedLine.id, updatedLine.productCategory.id);
        expect(mockedContract.assignMaterial)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.assignMaterial)
            .toHaveBeenNthCalledWith(1, updatedLine.id, updatedLine.material!.id);
        expect(mockedWait)
            .toHaveBeenCalledTimes(2);
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly set the new name', async () => {
        await basicTradeDriver.setName('new name');

        expect(mockedContract.setName)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.setName)
            .toHaveBeenNthCalledWith(1, 'new name');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });
});
