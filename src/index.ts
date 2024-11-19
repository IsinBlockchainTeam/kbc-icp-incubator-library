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

export { CredentialStatus } from './types/CredentialStatus';
export { CredentialRevocationDriver } from './drivers/CredentialRevocationDriver';
export { CredentialRevocationService } from './services/CredentialRevocationService';

export { Document, DocumentInfo } from './entities/Document';

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
export {
    DocumentInfo as ShipmentDocumentInfo,
    DocumentType as ShipmentDocumentType
} from './entities/Document';
export { ShipmentDriver } from './drivers/ShipmentDriver';
export {
    ShipmentService,
    ShipmentPhaseDocument,
    ShipmentDocument,
    ShipmentDocumentMetadata
} from './services/ShipmentService';

export { ICPFileDriver } from './drivers/ICPFileDriver';

export { serial } from './utils/utils';
export { URL_SEGMENTS } from './constants/ICP';
export { URL_SEGMENT_INDEXES } from './constants/ICP';

// ICP refactor
// export {createActor} from 'icp-declarations/entity_manager'
export { Order, OrderStatus } from './entities/Order';
export { computeRoleProof, computeMembershipProof } from './drivers/proof';
export { OrderDriver, OrderParams } from './drivers/OrderDriver';
export { OrderService } from './services/OrderService';

export { Organization } from './entities/organization/Organization';
export { BroadedOrganization, OrganizationRole } from './entities/organization/BroadedOrganization';
export { NarrowedOrganization } from './entities/organization/NarrowedOrganization';
export { OrganizationDriver, OrganizationParams } from './drivers/OrganizationDriver';
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
