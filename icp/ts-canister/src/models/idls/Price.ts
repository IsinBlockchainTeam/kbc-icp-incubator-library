import { IDL } from 'azle';

export const Price = IDL.Record({
    amount: IDL.Float32,
    fiat: IDL.Text
});
