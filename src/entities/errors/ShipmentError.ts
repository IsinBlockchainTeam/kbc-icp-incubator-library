export class ShipmentNotFoundError extends Error {
    constructor() {
        super(`Shipment not found.`);
    }
}
export class ShipmentInWrongPhaseError extends Error {
    constructor() {
        super(`Shipment in wrong phase.`);
    }
}
export class ShipmentDetailsAlreadyApprovedError extends Error {
    constructor() {
        super(`Shipment details already approved.`);
    }
}
export class ShipmentSampleAlreadyApprovedError extends Error {
    constructor() {
        super(`Shipment sample already approved.`);
    }
}
export class ShipmentDetailsNotSetError extends Error {
    constructor() {
        super(`Shipment details not set.`);
    }
}
export class ShipmentQualityAlreadyApprovedError extends Error {
    constructor() {
        super(`Shipment quality already approved.`);
    }
}
export class ShipmentFundsAlreadyLockedError extends Error {
    constructor() {
        super(`Shipment funds already locked.`);
    }
}
export class ShipmentDownPaymentAddressNotFound extends Error {
    constructor() {
        super(`Shipment Down Payment address not found.`);
    }
}
