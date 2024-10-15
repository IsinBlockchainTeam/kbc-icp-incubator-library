import {IDL} from "azle";

export const GetAddressResponse = IDL.Variant({
    Ok: IDL.Text,
    Err: IDL.Text,
});
