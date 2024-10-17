import { IDL } from 'azle';

export type ProductCategory = {
    id: bigint;
    name: string;
    quality: bigint;
    description: string;
};
export const ProductCategory = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    quality: IDL.Nat,
    description: IDL.Text
});
