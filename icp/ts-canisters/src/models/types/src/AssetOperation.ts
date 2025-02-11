import { Material } from './Material';

export type AssetOperation = {
    id: bigint;
    name: string;
    inputMaterials: Material[];
    outputMaterial: Material;
    latitude: string;
    longitude: string;
    processTypes: string[];
};
