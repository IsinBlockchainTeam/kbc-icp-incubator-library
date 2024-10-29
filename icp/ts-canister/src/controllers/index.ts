import MaterialController from "./MaterialController";
import ProductCategoryController from "./ProductCategoryController";
import OrderController from "./OrderController";
import ShipmentController from "./ShipmentController";
import AuthenticationController from "./AuthenticationController";
import OrganizationController from "./OrganizationController";

export default class {
    _authenticationController = new AuthenticationController();
    _materialController = new MaterialController();
    _productCategoryController = new ProductCategoryController();
    _orderController = new OrderController();
    _shipmentController = new ShipmentController();
    _organizationController = new OrganizationController();
}
