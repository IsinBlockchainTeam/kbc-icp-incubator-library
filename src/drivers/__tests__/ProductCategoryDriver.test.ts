import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { ProductCategoryDriver } from '../ProductCategoryDriver';
import { EntityBuilder } from '../../utils/EntityBuilder';
import { ProductCategory } from '../../entities/ProductCategory';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('ProductCategoryDriver', () => {
    let productCategoryDriver: ProductCategoryDriver;
    const mockFn = {
        getProductCategories: jest.fn(),
        getProductCategory: jest.fn(),
        createProductCategory: jest.fn(),
        updateProductCategory: jest.fn()
    };
    const defaultProductCategory = { name: 'test' } as ProductCategory;

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getProductCategories: mockFn.getProductCategories,
            getProductCategory: mockFn.getProductCategory,
            createProductCategory: mockFn.createProductCategory,
            updateProductCategory: mockFn.updateProductCategory
        });
        jest.spyOn(EntityBuilder, 'buildProductCategory').mockReturnValue(defaultProductCategory);
        const icpIdentity = {} as Identity;
        productCategoryDriver = new ProductCategoryDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve product categories', async () => {
        const rawProductCategory = { name: 'test' };
        mockFn.getProductCategories.mockReturnValue([rawProductCategory]);
        await expect(productCategoryDriver.getProductCategories()).resolves.toEqual([
            defaultProductCategory
        ]);
        expect(mockFn.getProductCategories).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledWith(rawProductCategory);
    });

    it('should retrieve a product category', async () => {
        const rawProductCategory = { name: 'test' };
        mockFn.getProductCategory.mockReturnValue(rawProductCategory);
        await expect(productCategoryDriver.getProductCategory(1)).resolves.toEqual(
            defaultProductCategory
        );
        expect(mockFn.getProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledWith(rawProductCategory);
    });

    it('should create a product category', async () => {
        const rawProductCategory = { name: 'test' };
        mockFn.createProductCategory.mockReturnValue(rawProductCategory);
        await expect(
            productCategoryDriver.createProductCategory('test', 1, 'test')
        ).resolves.toEqual(defaultProductCategory);
        expect(mockFn.createProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledWith(rawProductCategory);
    });

    it('should update a product category', async () => {
        const rawProductCategory = { name: 'test' };
        mockFn.updateProductCategory.mockReturnValue(rawProductCategory);
        await expect(
            productCategoryDriver.updateProductCategory(1, 'test', 1, 'test')
        ).resolves.toEqual(defaultProductCategory);
        expect(mockFn.updateProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalled();
        expect(EntityBuilder.buildProductCategory).toHaveBeenCalledWith(rawProductCategory);
    });
});
