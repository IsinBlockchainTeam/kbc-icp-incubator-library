import { IDL } from 'azle';

export const IDLGetAddressResponse = IDL.Variant({
    Ok: IDL.Text,
    Err: IDL.Text
});
