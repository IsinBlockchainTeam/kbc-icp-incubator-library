import MaterialController from "./MaterialController";
import ProductCategoryController from "./ProductCategoryController";
import OrderController from "./OrderController";
import ShipmentController from "./ShipmentController";
import AuthenticationController from "./AuthenticationController";
import OfferController from "./OfferController";
import {IDL, update} from "azle";
import {ethers} from "ethers";
import {ecdsaPublicKey} from "../utils/ecdsa";
import {ic} from "azle/experimental";

export default class {
    _authenticationController = new AuthenticationController();
    _materialController = new MaterialController();
    _productCategoryController = new ProductCategoryController();
    _orderController = new OrderController();
    _shipmentController = new ShipmentController();
    _offerController = new OfferController();

    @update([], IDL.Text)
    async getCanisterAddress(): Promise<string> {
        return ethers.computeAddress(
            ethers.hexlify(
                await ecdsaPublicKey([ic.id().toUint8Array()])
            )
        );
    }
}
