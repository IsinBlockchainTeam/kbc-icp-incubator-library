import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import {
    ProductCategoryManager,
    ProductCategoryManager__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { ProductCategory } from '../entities/ProductCategory';

describe('ProductCategoryDriver', () => {
    let productCategoryDriver: ProductCategoryDriver;
    let mockedSigner: Signer;
    const name: string = 'name';
    const quality: number = 1;
    const description: string = 'description';

    const mockedProductCategoryStructOutput: ProductCategoryManager.ProductCategoryStructOutput = {
        name,
        quality,
        description,
        exists: true,
    } as ProductCategoryManager.ProductCategoryStructOutput;
    const mockedProductCategory: ProductCategory = createMock<ProductCategory>();

    const mockedProductCategoryManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetProductCategoriesCounter = jest.fn();
    const mockedGetProductCategoryExists = jest.fn();
    const mockedGetProductCategory = jest.fn();

    const mockedEvents = [
        {
            event: 'ProductCategoryRegistered',
            args: {
                id: BigNumber.from(1),
            },
        },
    ];
    mockedWait.mockReturnValue({ events: mockedEvents });
    mockedWriteFunction.mockReturnValue({ wait: mockedWait });
    mockedGetProductCategoriesCounter.mockReturnValue(BigNumber.from(2));
    mockedGetProductCategoryExists.mockReturnValue(true);
    mockedGetProductCategory.mockReturnValue(mockedProductCategoryStructOutput);

    const mockedContract = createMock<ProductCategoryManager>({
        connect: mockedProductCategoryManagerConnect,
        getProductCategoriesCounter: mockedGetProductCategoriesCounter,
        getProductCategoryExists: mockedGetProductCategoryExists,
        getProductCategory: mockedGetProductCategory,
        registerProductCategory: mockedWriteFunction,
        updateProductCategory: mockedWriteFunction
    });

    beforeAll(() => {
        mockedProductCategoryManagerConnect.mockReturnValue(mockedContract);
        const mockedProductCategoryManager = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect,
        });
        jest.spyOn(ProductCategoryManager__factory, 'connect').mockReturnValue(mockedProductCategoryManager);
        const buildProductCategorySpy = jest.spyOn(EntityBuilder, 'buildProductCategory');
        buildProductCategorySpy.mockReturnValue(mockedProductCategory);

        mockedSigner = createMock<Signer>();
        productCategoryDriver = new ProductCategoryDriver(mockedSigner, Wallet.createRandom().address);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it('should correctly register a product category', async () => {
        await productCategoryDriver.registerProductCategory(name, quality, description);

        expect(mockedContract.registerProductCategory).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerProductCategory).toHaveBeenNthCalledWith(1, name, quality, description);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a product category - FAIL(Error during product category registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined,
        });
        await expect(productCategoryDriver.registerProductCategory(name, quality, description)).rejects.toThrowError('Error during product category registration, no events found');
    });

    it('should correctly update a product category', async () => {
        await productCategoryDriver.updateProductCategory(1, 'new', 20, 'updated');

        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWriteFunction).toHaveBeenNthCalledWith(1, 1, 'new', 20, 'updated');

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly get the product category counter', async () => {
        const counter: number = await productCategoryDriver.getProductCategoryCounter();

        expect(mockedGetProductCategoriesCounter).toHaveBeenCalledTimes(1);
        expect(counter).toEqual(2);
    });

    it('should correctly get the product category exists', async () => {
        const exists: boolean = await productCategoryDriver.getProductCategoryExists(1);

        expect(mockedGetProductCategoryExists).toHaveBeenCalledTimes(1);
        expect(exists).toEqual(true);
    });

    it('should correctly get the product category', async () => {
        const productCategory: ProductCategory = await productCategoryDriver.getProductCategory(1);

        expect(mockedGetProductCategory).toHaveBeenCalledTimes(1);
        expect(productCategory).toEqual(mockedProductCategory);
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildProductCategory).toHaveBeenNthCalledWith(1, mockedProductCategoryStructOutput);
    });

    it('should correctly get the product categories', async () => {
        const productCategories: ProductCategory[] = await productCategoryDriver.getProductCategories();

        expect(mockedGetProductCategoriesCounter).toHaveBeenCalledTimes(1);
        expect(mockedGetProductCategory).toHaveBeenCalledTimes(2);
        expect(productCategories).toEqual([mockedProductCategory, mockedProductCategory]);
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledTimes(2);
        expect(EntityBuilder.buildProductCategory).toHaveBeenNthCalledWith(1, mockedProductCategoryStructOutput);
        expect(EntityBuilder.buildProductCategory).toHaveBeenNthCalledWith(2, mockedProductCategoryStructOutput);
    });
});
