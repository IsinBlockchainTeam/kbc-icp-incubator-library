import { IDL } from "azle";

export const IDLOrganization = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    description: IDL.Text,
});
