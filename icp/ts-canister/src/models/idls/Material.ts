import {IDL} from "azle";
import {ProductCategory} from "./ProductCategory";

export const Material = IDL.Record({
    id: IDL.Nat,
    productCategory: ProductCategory,
});
