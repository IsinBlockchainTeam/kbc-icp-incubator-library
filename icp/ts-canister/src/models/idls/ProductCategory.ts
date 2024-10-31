import {IDL} from "azle";

export const IDLProductCategory = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    quality: IDL.Nat,
    description: IDL.Text,
});
