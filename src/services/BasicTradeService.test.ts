import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { BasicTradeService } from './BasicTradeService';
import { Line, LineRequest } from '../entities/Trade';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { Material } from '../entities/Material';
import { ProductCategory } from '../entities/ProductCategory';

describe('BasicTradeService', () => {
    const mockedBasicTradeDriver: BasicTradeDriver = createMock<BasicTradeDriver>({
        getTrade: jest.fn(),
        getLines: jest.fn(),
        getLine: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
        assignMaterial: jest.fn(),
        setName: jest.fn()
    });
    const mockedDocumentDriver: DocumentDriver = createMock<DocumentDriver>({
        getDocumentById: jest.fn()
    });
    const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
        create: jest.fn()
    });
    const units = ['kg', 'g', 'l', 'm'];
    const productCategory = new ProductCategory(1, 'category', 85, 'description');
    const material = new Material(1, productCategory);

    const basicTradeService = new BasicTradeService(
        mockedBasicTradeDriver,
        mockedDocumentDriver,
        mockedIcpFileDriver
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => basicTradeService.getTrade(),
            expectedMockedFunction: mockedBasicTradeDriver.getTrade,
            expectedMockedFunctionArgs: [undefined]
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => basicTradeService.getLines(),
            expectedMockedFunction: mockedBasicTradeDriver.getLines,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => basicTradeService.getLine(1),
            expectedMockedFunction: mockedBasicTradeDriver.getLine,
            expectedMockedFunctionArgs: [1, undefined]
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () => basicTradeService.addLine(new LineRequest(1, 20, units[0])),
            expectedMockedFunction: mockedBasicTradeDriver.addLine,
            expectedMockedFunctionArgs: [new LineRequest(1, 20, units[0])]
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () =>
                basicTradeService.updateLine(new Line(1, material, productCategory, 100, units[1])),
            expectedMockedFunction: mockedBasicTradeDriver.updateLine,
            expectedMockedFunctionArgs: [new Line(1, material, productCategory, 100, units[1])]
        },
        {
            serviceFunctionName: 'assignMaterial',
            serviceFunction: () => basicTradeService.assignMaterial(1, 1),
            expectedMockedFunction: mockedBasicTradeDriver.assignMaterial,
            expectedMockedFunctionArgs: [1, 1]
        },
        {
            serviceFunctionName: 'setName',
            serviceFunction: () => basicTradeService.setName('name'),
            expectedMockedFunction: mockedBasicTradeDriver.setName,
            expectedMockedFunctionArgs: ['name']
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
        }
    );
});
