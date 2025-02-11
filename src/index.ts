export type { ExternalProvider } from '@ethersproject/providers';
export { Signer } from 'ethers';
export { SignerUtils } from './utils/SignerUtils';

export { type RoleProof } from './types/RoleProof';

export { Material } from './entities/Material';
export { MaterialDriver } from './drivers/MaterialDriver';
export { MaterialService } from './services/MaterialService';

export { ProductCategory } from './entities/ProductCategory';
export { ProductCategoryDriver } from './drivers/ProductCategoryDriver';
export { ProductCategoryService } from './services/ProductCategoryService';

export { NegotiationStatus } from './types/NegotiationStatus';
export { TradeType } from './types/TradeType';
export type { URLStructure } from './types/URLStructure';
export type { ResourceSpec } from './types/ResourceSpec';

export { type CredentialStatus } from './types/CredentialStatus';
export { CredentialRevocationDriver } from './drivers/CredentialRevocationDriver';
export { CredentialRevocationService } from './services/CredentialRevocationService';

export {
    type Document,
    type DocumentInfo,
    DocumentType,
    DocumentStatus
} from './entities/Document';

export { Offer } from './entities/Offer';
export { OfferDriver } from './drivers/OfferDriver';
export { OfferService } from './services/OfferService';

export { DownPayment } from './entities/DownPayment';
export { DownPaymentManagerDriver } from './drivers/DownPaymentManagerDriver';
export { DownPaymentManagerService } from './services/DownPaymentManagerService';
export { DownPaymentDriver } from './drivers/DownPaymentDriver';
export { DownPaymentService } from './services/DownPaymentService';
export { TokenDriver } from './drivers/TokenDriver';
export { TokenService } from './services/TokenService';

export { Shipment, Phase as ShipmentPhase, FundStatus } from './entities/Shipment';
export { EvaluationStatus } from './entities/Evaluation';
export { ShipmentDriver } from './drivers/ShipmentDriver';
export {
    ShipmentService,
    type ShipmentPhaseDocument,
    type ShipmentDocument as ShipmentDocumentType,
    type ShipmentDocumentMetadata
} from './services/ShipmentService';
export { DocumentTypeEnum } from '@kbc-lib/azle-types';

export { FileDriver } from './drivers/FileDriver';

export { serial } from './utils/utils';
export { URL_SEGMENTS } from './constants/ICP';
export { URL_SEGMENT_INDEXES } from './constants/ICP';

// ICP refactor
// export {createActor} from 'icp-declarations/entity_manager'
export {
    Order,
    type OrderLineRequest,
    type OrderLine,
    type OrderLinePrice,
    OrderStatus
} from './entities/Order';
export { computeRoleProof, computeMembershipProof } from './drivers/proof';
export { OrderDriver as ICPOrderDriver, type OrderParams } from './drivers/OrderDriver';
export { OrderService as ICPOrderService } from './services/OrderService';

export { Organization, OrganizationVisibilityLevel } from './entities/organization/Organization';
export { BroadedOrganization, OrganizationRole } from './entities/organization/BroadedOrganization';
export { NarrowedOrganization } from './entities/organization/NarrowedOrganization';
export { OrganizationDriver, type OrganizationParams } from './drivers/OrganizationDriver';
export { OrganizationService } from './services/OrganizationService';

export { BusinessRelation } from './entities/BusinessRelation';
export { BusinessRelationDriver } from './drivers/BusinessRelationDriver';
export { BusinessRelationService } from './services/BusinessRelationService';

// export {createActor} from 'icp-declarations/entity_manager'
export { AuthenticationDriver as ICPAuthenticationDriver } from './drivers/AuthenticationDriver';
export { AuthenticationService as ICPAuthenticationService } from './services/AuthenticationService';

export { OfferDriver as ICPOfferDriver } from './drivers/OfferDriver';
export { OfferService as ICPOfferService } from './services/OfferService';

export { ProductCategoryDriver as ICPProductCategoryDriver } from './drivers/ProductCategoryDriver';
export { ProductCategoryService as ICPProductCategoryService } from './services/ProductCategoryService';

export { MaterialDriver as ICPMaterialDriver } from './drivers/MaterialDriver';
export { MaterialService as ICPMaterialService } from './services/MaterialService';

export { AssetOperation } from './entities/AssetOperation';
export {
    AssetOperationDriver as ICPAssetOperationDriver,
    type AssetOperationParams
} from './drivers/AssetOperationDriver';
export { AssetOperationService as ICPAssetOperationService } from './services/AssetOperationService';

// Errors
export {
    NotAuthenticatedError,
    NotAuthorizedError,
    NotValidCredentialError
} from './entities/errors';

// certification
export { CertificationDriver as ICPCertificationDriver } from './drivers/CertificationDriver';
export { CertificationService as ICPCertificationService } from './services/CertificationService';
export {
    BaseCertificate as ICPBaseCertificate,
    CertificateType as ICPCertificateType,
    CertificateDocumentType as ICPCertificateDocumentType,
    type CertificateDocumentInfo as ICPCertificateDocumentInfo,
    type CertificateDocument as ICPCertificateDocument
} from './entities/Certificate';
export { CompanyCertificate as ICPCompanyCertificate } from './entities/CompanyCertificate';
export { ScopeCertificate as ICPScopeCertificate } from './entities/ScopeCertificate';
export { MaterialCertificate as ICPMaterialCertificate } from './entities/MaterialCertificate';

// enumerations
export { FiatDriver as ICPFiatDriver } from './drivers/FiatDriver';
export { FiatService as ICPFiatService } from './services/FiatService';
export { UnitDriver as ICPUnitDriver } from './drivers/UnitDriver';
export { UnitService as ICPUnitService } from './services/UnitService';
export { ProcessTypeDriver as ICPProcessTypeDriver } from './drivers/ProcessTypeDriver';
export { ProcessTypeService as ICPProcessTypeService } from './services/ProcessTypeService';
export { AssessmentReferenceStandard as ICPAssessmentReferenceStandard } from './entities/AssessmentReferenceStandard';
export { AssessmentReferenceStandardDriver as ICPAssessmentStandardDriver } from './drivers/AssessmentReferenceStandardDriver';
export { AssessmentReferenceStandardService as ICPAssessmentStandardService } from './services/AssessmentReferenceStandardService';
export { AssessmentAssuranceLevelDriver as ICPAssessmentAssuranceLevelDriver } from './drivers/AssessmentAssuranceLevelDriver';
export { AssessmentAssuranceLevelService as ICPAssessmentAssuranceLevelService } from './services/AssessmentAssuranceLevelService';

export { SiweIdentityProvider } from './drivers/SiweIdentityProvider';
export { IdentityDriver } from './drivers/IdentityDriver';
export { StorageDriver } from './drivers/StorageDriver';
export {
    SiweDriver,
    type SiweIdentityContextType,
    type LoginOkResponse,
    type SIWE_IDENTITY_SERVICE,
    type ISignedDelegation,
    type State
} from './drivers/SiweDriver';
export { FileHelpers } from './utils/FileHelpers';
