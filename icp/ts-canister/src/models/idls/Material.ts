import {IDL} from "azle";
import {IDLProductCategory} from "./ProductCategory";

export const IDLMaterial = IDL.Record({
    id: IDL.Nat,
    productCategory: IDLProductCategory,
});
