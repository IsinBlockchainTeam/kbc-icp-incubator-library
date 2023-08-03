import {
    MaterialStructOutput,
    TradeStructOutput,
    TransformationStructOutput
} from "../smart-contracts/contracts/SupplyChainManager";
import {Material} from "../entities/Material";
import {Trade} from "../entities/Trade";
import {Transformation} from "../entities/Transformation";

export class EntityBuilder {
    static buildMaterial(bcMaterial: MaterialStructOutput): Material {
        return new Material(bcMaterial.id.toNumber(), bcMaterial.name, bcMaterial.owner)
    }
    static buildTrade(bcTrade: TradeStructOutput): Trade {
        return new Trade(bcTrade.id.toNumber(), bcTrade.name, bcTrade.materialsIds.map(([id1, id2]) => [id1.toNumber(), id2.toNumber()]), bcTrade.owner);
    }

    static buildTransformation(bcTransformation: TransformationStructOutput): Transformation {
        return new Transformation(bcTransformation.id.toNumber(), bcTransformation.name, bcTransformation.inputMaterialsIds.map(id => id.toNumber()), bcTransformation.outputMaterialId.toNumber(), bcTransformation.owner);
    }
}
