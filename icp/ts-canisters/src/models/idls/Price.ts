import { IDL } from 'azle';

export const IDLPrice = IDL.Record({
    amount: IDL.Float32,
    fiat: IDL.Text
});
