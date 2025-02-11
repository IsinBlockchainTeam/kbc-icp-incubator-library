import { ProductCategory } from './ProductCategory';

export type Material = {
    id: bigint;
    owner: string;
    name: string;
    productCategory: ProductCategory;
    typology: string;
    quality: string;
    moisture: string;
    isInput: boolean;
};
