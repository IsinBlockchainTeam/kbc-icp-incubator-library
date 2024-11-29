import { IDL, update } from 'azle';
import { ethers } from 'ethers';
import { ic } from 'azle/experimental';
import MaterialController from './MaterialController';
import ProductCategoryController from './ProductCategoryController';
import OrderController from './OrderController';
import ShipmentController from './ShipmentController';
import AuthenticationController from './AuthenticationController';
import OrganizationController from './OrganizationController';
import OfferController from './OfferController';
import { ecdsaPublicKey } from '../utils/ecdsa';
import CertificationController from './CertificationController';
import FiatController from './FiatController';
import UnitController from './UnitController';
import ProcessTypeController from './ProcessTypeController';
import AssessmentStandardController from './AssessmentStandardController';
import AssessmentAssuranceLevelController from './AssessmentAssuranceLevelController';

export default class {
    _authenticationController = new AuthenticationController();

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

    _organizationController = new OrganizationController();

    _offerController = new OfferController();

    @update([], IDL.Text)
    async getCanisterAddress(): Promise<string> {
        return ethers.computeAddress(ethers.hexlify(await ecdsaPublicKey([ic.id().toUint8Array()])));
    }
}
