import {ErrorType} from "../types";

export class ShipmentNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_NOT_FOUND}) Shipment not found.`);
        this.name = 'ShipmentNotFoundError';
    }
}
export class ShipmentInWrongPhaseError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_WRONG_PHASE}) Shipment in wrong phase.`);
        this.name = 'ShipmentInWrongPhaseError';
    }
}
export class ShipmentDetailsAlreadyApprovedError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_ALREADY_APPROVED}) Shipment details already approved.`);
        this.name = 'ShipmentDetailsAlreadyApprovedError';
    }
}
export class ShipmentSampleAlreadyApprovedError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_SAMPLE_ALREADY_APPROVED}) Shipment sample already approved.`);
        this.name = 'ShipmentSampleAlreadyApprovedError';
    }
}
export class ShipmentDetailsNotSetError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_DETAILS_NOT_SET}) Shipment details not set.`);
        this.name = 'ShipmentDetailsNotSetError';
    }
}
export class ShipmentQualityAlreadyApprovedError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_QUALITY_ALREADY_APPROVED}) Shipment quality already approved.`);
        this.name = 'ShipmentQualityAlreadyApprovedError';
    }
}
export class ShipmentFundsAlreadyLockedError extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_FUNDS_ALREADY_LOCKED}) Shipment funds already locked.`);
        this.name = 'ShipmentFundsAlreadyLockedError';
    }
}
export class ShipmentDownPaymentAddressNotFound extends Error {
    constructor() {
        super(`(${ErrorType.SHIPMENT_DOWN_PAYMENT_ADDRESS_NOT_FOUND}) Shipment Down Payment address not found.`);
        this.name = 'ShipmentDownPaymentAddressNotFound';
    }
}
