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

export { Escrow } from './entities/Escrow';
export { EscrowManagerDriver } from './drivers/EscrowManagerDriver';
export { EscrowManagerService } from './services/EscrowManagerService';
export { EscrowDriver } from './drivers/EscrowDriver';
export { EscrowService } from './services/EscrowService';
export { TokenDriver } from './drivers/TokenDriver';
export { TokenService } from './services/TokenService';

export { Shipment, Phase as ShipmentPhase, FundStatus } from './entities/Shipment';
export { EvaluationStatus } from './entities/Evaluation';
export { ShipmentDriver } from './drivers/ShipmentDriver';
export {
    ShipmentService,
    type ShipmentPhaseDocument,
    type ShipmentDocument,
    type ShipmentDocumentMetadata
} from './services/ShipmentService';

export { ICPFileDriver } from './drivers/ICPFileDriver';

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
export { OrderDriver, type OrderParams } from './drivers/OrderDriver';
export { OrderService } from './services/OrderService';

export { Organization } from './entities/organization/Organization';
export { BroadedOrganization, OrganizationRole } from './entities/organization/BroadedOrganization';
export { NarrowedOrganization } from './entities/organization/NarrowedOrganization';
export { OrganizationDriver, type OrganizationParams } from './drivers/OrganizationDriver';
export { OrganizationService } from './services/OrganizationService';

// export {createActor} from 'icp-declarations/entity_manager'
export { AuthenticationDriver as ICPAuthenticationDriver } from './drivers/AuthenticationDriver';
export { AuthenticationService as ICPAuthenticationService } from './services/AuthenticationService';

export { OfferDriver as ICPOfferDriver } from './drivers/OfferDriver';
export { OfferService as ICPOfferService } from './services/OfferService';

export { ProductCategoryDriver as ICPProductCategoryDriver } from './drivers/ProductCategoryDriver';
export { ProductCategoryService as ICPProductCategoryService } from './services/ProductCategoryService';

export { MaterialDriver as ICPMaterialDriver } from './drivers/MaterialDriver';
export { MaterialService as ICPMaterialService } from './services/MaterialService';

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
export { AssessmentStandardDriver as ICPAssessmentStandardDriver } from './drivers/AssessmentStandardDriver';
export { AssessmentStandardService as ICPAssessmentStandardService } from './services/AssessmentStandardService';
export { AssessmentAssuranceLevelDriver as ICPAssessmentAssuranceLevelDriver } from './drivers/AssessmentAssuranceLevelDriver';
export { AssessmentAssuranceLevelService as ICPAssessmentAssuranceLevelService } from './services/AssessmentAssuranceLevelService';
