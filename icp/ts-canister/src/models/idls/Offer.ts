import {IDL} from "azle";
import {IDLProductCategory} from "./ProductCategory";

export const IDLOffer = IDL.Record({
    id: IDL.Nat,
    owner: IDL.Text,
    productCategory: IDLProductCategory,
});
