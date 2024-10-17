import MaterialController from "./MaterialController";
import ProductCategoryController from "./ProductCategoryController";
import OrderController from "./OrderController";
import ShipmentController from "./ShipmentController";

export default class {
    _materialController = new MaterialController();
    _productCategoryController = new ProductCategoryController();
    _orderController = new OrderController();
    _shipmentController = new ShipmentController();
}
