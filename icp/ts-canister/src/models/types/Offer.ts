import {ProductCategory} from "./ProductCategory";

export type Offer = {
    id: bigint;
    owner: string;
    productCategory: ProductCategory;
}
