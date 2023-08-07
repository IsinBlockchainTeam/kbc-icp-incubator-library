import { EntityBuilder } from './EntityBuilder';
import {BigNumber} from "ethers";
import {Material} from "../entities/Material";
import {
    MaterialStructOutput,
    TradeStructOutput,
    TransformationStructOutput
} from "../smart-contracts/contracts/SupplyChainManager";
import {Trade} from "../entities/Trade";
import {Transformation} from "../entities/Transformation";

describe('EntityBuilder', () => {
    describe('buildMaterial', () => {
        it('should correctly build a material', () => {
            const bcMaterial: MaterialStructOutput = [BigNumber.from(0), 'material', 'owner'] as MaterialStructOutput;
            bcMaterial.id = BigNumber.from(0);
            bcMaterial.name = 'material';
            bcMaterial.owner = 'owner';

            expect(EntityBuilder.buildMaterial(bcMaterial)).toEqual(new Material(0, 'material', 'owner'));
        });
    });

    describe('buildTrade', () => {
        it('should correctly build a trade', () => {
            const bcTrade: TradeStructOutput = [BigNumber.from(0), 'trade', [[BigNumber.from(1), BigNumber.from(2)]], 'owner'] as TradeStructOutput;
            bcTrade.id = BigNumber.from(0);
            bcTrade.name = 'trade';
            bcTrade.materialsIds = [[BigNumber.from(1), BigNumber.from(2)]];
            bcTrade.owner = 'owner';

            expect(EntityBuilder.buildTrade(bcTrade)).toEqual(new Trade(0, 'trade', [[1, 2]], 'owner'));
        });
    });

    describe('buildTransformation', () => {
        it('should correctly build a transformation', () => {
            const bcTransformation: TransformationStructOutput = [BigNumber.from(0), 'transformation', [BigNumber.from(1), BigNumber.from(2)], BigNumber.from(3), 'owner'] as TransformationStructOutput;
            bcTransformation.id = BigNumber.from(0);
            bcTransformation.name = 'transformation';
            bcTransformation.inputMaterialsIds = [BigNumber.from(1), BigNumber.from(2)];
            bcTransformation.outputMaterialId = BigNumber.from(3);
            bcTransformation.owner = 'owner';

            expect(EntityBuilder.buildTransformation(bcTransformation)).toEqual(new Transformation(0, 'transformation', [1, 2], 3, 'owner'));
        });
    });
});
