import {IDL} from "azle";

export type Price = {
    amount: number;
    fiat: string;
};

export const Price = IDL.Record({
    amount: IDL.Float32,
    fiat: IDL.Text,
});
