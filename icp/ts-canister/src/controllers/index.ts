import MaterialController from './MaterialController';
import ProductCategoryController from './ProductCategoryController';
import OrderController from './OrderController';
import ShipmentController from './ShipmentController';
import EnumerationController from './EnumerationController';
import CertificationController from './CertificationController';

export default class {
    _materialController = new MaterialController();

    _productCategoryController = new ProductCategoryController();

    _orderController = new OrderController();

    _shipmentController = new ShipmentController();

    _enumerationController = new EnumerationController();

    _certificationController = new CertificationController();
}
