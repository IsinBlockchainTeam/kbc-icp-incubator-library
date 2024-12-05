export enum ErrorType {
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',
    NOT_VALID_CREDENTIAL = 'NOT_VALID_CREDENTIAL',
    MATERIAL_NOT_FOUND = 'MATERIAL_NOT_FOUND',
    PRODUCT_CATEGORY_NOT_FOUND = 'PRODUCT_CATEGORY_NOT_FOUND',
    OFFER_NOT_FOUND = 'OFFER_NOT_FOUND',
    ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
    ORDER_ALREADY_CONFIRMED = 'ORDER_ALREADY_CONFIRMED',
    ORDER_ALREADY_SIGNED = 'ORDER_ALREADY_SIGNED',
    ENUMERATION_ALREADY_EXISTS = 'ENUMERATION_ALREADY_EXISTS',
    ENUMERATION_NOT_FOUND = 'ENUMERATION_NOT_FOUND',
    SAME_ACTORS = 'SAME_ACTORS',
    ORDER_NO_CHANGES = 'ORDER_NO_CHANGES',
    DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
    DOCUMENT_ALREADY_APPROVED = 'DOCUMENT_ALREADY_APPROVED',
    CALLER_IS_THE_UPLOADER = 'CALLER_IS_THE_UPLOADER',
    SHIPMENT_NOT_FOUND = 'SHIPMENT_NOT_FOUND',
    SHIPMENT_WRONG_PHASE = 'SHIPMENT_WRONG_PHASE',
    SHIPMENT_ALREADY_APPROVED = 'SHIPMENT_ALREADY_APPROVED',
    SHIPMENT_SAMPLE_ALREADY_APPROVED = 'SHIPMENT_SAMPLE_ALREADY_APPROVED',
    SHIPMENT_DETAILS_NOT_SET = 'SHIPMENT_DETAILS_NOT_SET',
    SHIPMENT_QUALITY_ALREADY_APPROVED = 'SHIPMENT_QUALITY_ALREADY_APPROVED',
    SHIPMENT_FUNDS_ALREADY_LOCKED = 'SHIPMENT_FUNDS_ALREADY_LOCKED',
    SHIPMENT_DOWN_PAYMENT_ADDRESS_NOT_FOUND = 'SHIPMENT_DOWN_PAYMENT_ADDRESS_NOT_FOUND',
    ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
    EVALUATION_STATUS_INVALID = 'INVALID_EVALUATION_STATUS',
    CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND',
    CERTIFICATE_TYPE_INVALID = 'INVALID_CERTIFICATE_TYPE',
    CERTIFICATE_TYPE_MISMATCH = 'CERTIFICATE_TYPE_MISMATCH',
    ASSESSMENT_REFERENCE_STANDARD_NOT_FOUND = 'ASSESSMENT_REFERENCE_STANDARD_NOT_FOUND'
}
