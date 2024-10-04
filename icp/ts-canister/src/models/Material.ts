import { IDL } from 'azle';

export type Material = {
    id: number;
    productCategoryId: number;
};
export const Material = IDL.Record({
    id: IDL.Nat,
    productCategoryId: IDL.Nat
});
