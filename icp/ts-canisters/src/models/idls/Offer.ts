import { IDL } from "azle";
import { IDLMaterial } from "./Material";

export const IDLOffer = IDL.Record({
    id: IDL.Nat,
    owner: IDL.Text,
    material: IDLMaterial,
});
