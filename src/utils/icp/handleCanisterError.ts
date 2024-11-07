import {ErrorType} from "@kbc-lib/azle-types";
import {
    DocumentAlreadyApprovedError,
    DocumentNotFoundError,
    MaterialNotFoundError,
    NotAuthenticatedError,
    NotAuthorizedError,
    NotValidCredentialError,
    OfferNotFoundError,
    OrderAlreadyConfirmedError,
    OrderAlreadySignedError,
    OrderNotFoundError,
    OrderWithNoChangesError,
    ProductCategoryNotFoundError,
    SameActorsError,
    ShipmentDetailsAlreadyApprovedError,
    ShipmentDetailsNotSetError,
    ShipmentDownPaymentAddressNotFound,
    ShipmentFundsAlreadyLockedError,
    ShipmentInWrongPhaseError,
    ShipmentNotFoundError,
    ShipmentQualityAlreadyApprovedError,
    ShipmentSampleAlreadyApprovedError
} from "../../entities/icp/errors";

const errorTypeToException = {
    [ErrorType.SAME_ACTORS]: SameActorsError,
    [ErrorType.NOT_AUTHENTICATED]: NotAuthenticatedError,
    [ErrorType.NOT_AUTHORIZED]: NotAuthorizedError,
    [ErrorType.NOT_VALID_CREDENTIAL]: NotValidCredentialError,
    [ErrorType.DOCUMENT_NOT_FOUND]: DocumentNotFoundError,
    [ErrorType.DOCUMENT_ALREADY_APPROVED]: DocumentAlreadyApprovedError,
    [ErrorType.MATERIAL_NOT_FOUND]: MaterialNotFoundError,
    [ErrorType.OFFER_NOT_FOUND]: OfferNotFoundError,
    [ErrorType.ORDER_NOT_FOUND]: OrderNotFoundError,
    [ErrorType.ORDER_NO_CHANGES]: OrderWithNoChangesError,
    [ErrorType.ORDER_ALREADY_SIGNED]: OrderAlreadySignedError,
    [ErrorType.ORDER_ALREADY_CONFIRMED]: OrderAlreadyConfirmedError,
    [ErrorType.PRODUCT_CATEGORY_NOT_FOUND]: ProductCategoryNotFoundError,
    [ErrorType.SHIPMENT_NOT_FOUND]: ShipmentNotFoundError,
    [ErrorType.SHIPMENT_WRONG_PHASE]: ShipmentInWrongPhaseError,
    [ErrorType.SHIPMENT_DETAILS_NOT_SET]: ShipmentDetailsNotSetError,
    [ErrorType.SHIPMENT_ALREADY_APPROVED]: ShipmentDetailsAlreadyApprovedError,
    [ErrorType.SHIPMENT_QUALITY_ALREADY_APPROVED]: ShipmentQualityAlreadyApprovedError,
    [ErrorType.SHIPMENT_SAMPLE_ALREADY_APPROVED]: ShipmentSampleAlreadyApprovedError,
    [ErrorType.SHIPMENT_FUNDS_ALREADY_LOCKED]: ShipmentFundsAlreadyLockedError,
    [ErrorType.SHIPMENT_DOWN_PAYMENT_ADDRESS_NOT_FOUND]: ShipmentDownPaymentAddressNotFound
}
export const handleCanisterError = (error: unknown) => {
    const stringError = String(error);
    Object
        .entries(errorTypeToException)
        .forEach(([errorType, Exc]) => {
            if (stringError.includes(errorType))
                throw new Exc();
        });
    throw error;
}
