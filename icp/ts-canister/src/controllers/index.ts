import MaterialController from './MaterialController';
import ProductCategoryController from './ProductCategoryController';
import OrderController from './OrderController';
import ShipmentController from './ShipmentController';
import CertificationController from './CertificationController';
import FiatController from './FiatController';
import { UnitController } from './UnitController';
import ProcessTypeController from './ProcessTypeController';
import AssessmentStandardController from './AssessmentStandardController';
import AssessmentAssuranceLevelController from './AssessmentAssuranceLevelController';

export default class {
    _materialController = new MaterialController();

    _productCategoryController = new ProductCategoryController();

    _orderController = new OrderController();

    _shipmentController = new ShipmentController();

    _certificationController = new CertificationController();

    _fiatController = new FiatController();

    _unitController = new UnitController();

    _processTypeController = new ProcessTypeController();

    _assessmentStandardController = new AssessmentStandardController();

    _assessmentAssuranceLevelController = new AssessmentAssuranceLevelController();
}
