import { IDL } from 'azle';

export type Material = {
    id: bigint;
    productCategoryId: bigint;
};
export const Material = IDL.Record({
    id: IDL.Nat,
    productCategoryId: IDL.Nat
});
