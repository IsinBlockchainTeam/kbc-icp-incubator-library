import { IDL } from 'azle';
import { IDLMaterial } from './Material';

export const IDLAssetOperation = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    inputMaterials: IDL.Vec(IDLMaterial),
    outputMaterial: IDLMaterial,
    latitude: IDL.Text,
    longitude: IDL.Text,
    processTypes: IDL.Vec(IDL.Text)
});
