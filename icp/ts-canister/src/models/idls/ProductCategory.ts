import {IDL} from "azle";

export const ProductCategory = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    quality: IDL.Nat,
    description: IDL.Text,
});
