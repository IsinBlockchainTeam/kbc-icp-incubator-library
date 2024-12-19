import { ProductCategory } from './ProductCategory';

export type Material = {
    id: bigint;
    productCategory: ProductCategory;
    typology: string;
    quality: string;
    moisture: string;
};
