import {IDL} from "azle";
import {IDLProductCategory} from "./ProductCategory";

export const IDLMaterial = IDL.Record({
    id: IDL.Nat,
    owner: IDL.Text,
    name: IDL.Text,
    productCategory: IDLProductCategory,
    typology: IDL.Text,
    quality: IDL.Text,
    moisture: IDL.Text,
    isInput: IDL.Bool,
});
