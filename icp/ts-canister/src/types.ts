import {IDL} from "azle";

export type ProductCategory = {
    id: number;
    name: string;
    quality: number;
    description: string;
};
export const ProductCategory = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    quality: IDL.Nat,
    description: IDL.Text,
});
export type Material = {
    id: number;
    productCategoryId: number;
};
export const Material = IDL.Record({
    id: IDL.Nat,
    productCategoryId: IDL.Nat,
});

