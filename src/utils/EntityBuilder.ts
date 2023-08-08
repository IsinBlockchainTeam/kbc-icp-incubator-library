import {Material} from "../entities/Material";
import {Trade} from "../entities/Trade";
import {Transformation} from "../entities/Transformation";
import {Order} from "../entities/Order";
import {BigNumber} from "ethers";
import {OrderManager} from "../smart-contracts";
import {
    MaterialStructOutput,
    TradeStructOutput,
    TransformationStructOutput
} from "../smart-contracts/contracts/SupplyChainManager";
import {OrderLine, OrderLinePrice} from "../entities/OrderLine";

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

    static buildOrder(bcOrder: { id: BigNumber, supplier: string, customer: string, offeree: string, offeror: string, externalUrl: string, lineIds: BigNumber[] }): Order {
        return new Order(bcOrder.id.toNumber(), bcOrder.supplier, bcOrder.customer, bcOrder.externalUrl, bcOrder.offeree, bcOrder.offeror, bcOrder.lineIds.map(l => l.toNumber()));
    }

    static buildOrderLinePrice(bcOrderLinePrice: OrderManager.OrderLinePriceStructOutput): OrderLinePrice {
        return new OrderLinePrice(bcOrderLinePrice.amount.toNumber() / BigNumber.from(10).pow(bcOrderLinePrice.decimals).toNumber(), bcOrderLinePrice.fiat);
    }

    static buildOrderLine(bcOrderLine: OrderManager.OrderLineStructOutput): OrderLine {
        return new OrderLine(bcOrderLine.id.toNumber(), bcOrderLine.productCategory, bcOrderLine.quantity.toNumber(), this.buildOrderLinePrice(bcOrderLine.price));
    }


}
