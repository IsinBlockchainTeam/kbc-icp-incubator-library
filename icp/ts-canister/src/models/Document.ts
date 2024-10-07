import { Address } from './Address';
import { IDL } from 'azle';

export type Document = {
    id: number;
    externalUrl: string;
    contentHash: string;
    uploadedBy: Address;
};
export const Document = IDL.Record({
    id: IDL.Nat,
    externalUrl: IDL.Text,
    contentHash: IDL.Text,
    uploadedBy: Address,
});
