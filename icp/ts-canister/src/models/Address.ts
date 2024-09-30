import {IDL} from "azle";

export type Address = `0x${string}`;

export const GetAddressResponse = IDL.Variant({
    Ok: IDL.Text,
    Err: IDL.Text,
});
