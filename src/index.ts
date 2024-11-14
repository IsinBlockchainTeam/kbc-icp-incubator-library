export type { ExternalProvider } from '@ethersproject/providers';
export { Signer } from 'ethers';
export { SignerUtils } from './utils/SignerUtils';

export { Relationship } from './entities/Relationship';
export { RelationshipDriver } from './drivers/RelationshipDriver';
export { RelationshipService } from './services/RelationshipService';

export { type RoleProof } from './types/RoleProof';
export { DelegateManagerDriver } from './drivers/DelegateManagerDriver';
export { DelegateManagerService } from './services/DelegateManagerService';

export { Material } from './entities/Material';
export { MaterialDriver } from './drivers/MaterialDriver';
export { MaterialService } from './services/MaterialService';

export { ProductCategory } from './entities/ProductCategory';
export { ProductCategoryDriver } from './drivers/ProductCategoryDriver';
export { ProductCategoryService } from './services/ProductCategoryService';

export { AssetOperation } from './entities/AssetOperation';
export { AssetOperationType } from './types/AssetOperationType';
export { AssetOperationDriver } from './drivers/AssetOperationDriver';
export { AssetOperationService } from './services/AssetOperationService';

export { Trade, Line, LineRequest } from './entities/Trade';
export { BasicTrade, type BasicTradeMetadata } from './entities/BasicTrade';
export {
    OrderTrade,
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    type OrderTradeMetadata
} from './entities/OrderTrade';
export { NegotiationStatus } from './types/NegotiationStatus';
export { TradeType } from './types/TradeType';
export { TradeManagerDriver } from './drivers/TradeManagerDriver';
export { TradeManagerService } from './services/TradeManagerService';
export type { TradeManagerServiceArgs } from './services/TradeManagerService';
export { TradeDriver } from './drivers/TradeDriver';
export { TradeService } from './services/TradeService';
export { BasicTradeDriver } from './drivers/BasicTradeDriver';
export { BasicTradeService } from './services/BasicTradeService';
export { OrderTradeDriver, OrderTradeEvents } from './drivers/OrderTradeDriver';
export { OrderTradeService } from './services/OrderTradeService';
export type { IConcreteTradeService } from './services/IConcreteTradeService';
export type { URLStructure } from './types/URLStructure';

export { CredentialStatus } from './types/CredentialStatus';
export { CredentialRevocationDriver } from './drivers/CredentialRevocationDriver';
export { CredentialRevocationService } from './services/CredentialRevocationService';

export { DocumentInfo, DocumentType } from './entities/DocumentInfo';
export {
    Document,
    type DocumentMetadata,
    DocumentStatus,
    type TransactionLine
} from './entities/Document';
export { DocumentDriver } from './drivers/DocumentDriver';
export { DocumentService } from './services/DocumentService';

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

export { Shipment, Phase as ShipmentPhase, FundStatus } from './entities/icp/Shipment';
export { EvaluationStatus } from './entities/icp/Evaluation';
export {
    DocumentInfo as ShipmentDocumentInfo,
    DocumentType as ShipmentDocumentType
} from './entities/icp/Document';
export { ShipmentDriver } from './drivers/icp/ShipmentDriver';
export {
    ShipmentService,
    ShipmentPhaseDocument,
    ShipmentDocument,
    ShipmentDocumentMetadata
} from './services/icp/ShipmentService';

export {
    BaseCertificate,
    CertificateType,
    DocumentEvaluationStatus,
    DocumentType as CertificateDocumentType
} from './entities/Certificate';
export { CompanyCertificate } from './entities/CompanyCertificate';
export { ScopeCertificate } from './entities/ScopeCertificate';
export { MaterialCertificate } from './entities/MaterialCertificate';
export { CertificateManagerDriver } from './drivers/CertificateManagerDriver';
export {
    CertificateManagerService,
    CertificateDocument
} from './services/CertificateManagerService';

export type { ISolidStorageMetadataDriver } from './drivers/ISolidStorageMetadataDriver';
export type { ISolidStorageDocumentDriver } from './drivers/ISolidStorageDocumentDriver';
export { SolidMetadataDriver, type SolidMetadataSpec } from './drivers/SolidMetadataDriver';
export { SolidDocumentDriver, type SolidDocumentSpec } from './drivers/SolidDocumentDriver';

export { ICPFileDriver } from './drivers/ICPFileDriver';

export { GraphService, type GraphData } from './services/GraphService';

export { serial } from './utils/utils';
export { URL_SEGMENTS } from './constants/ICP';
export { URL_SEGMENT_INDEXES } from './constants/ICP';

// ICP refactor
// export {createActor} from 'icp-declarations/entity_manager'
export { Order, OrderStatus } from './entities/icp/Order';
export { computeRoleProof, computeMembershipProof } from './drivers/icp/proof';
export { OrderDriver, OrderParams } from './drivers/icp/OrderDriver';
export { OrderService } from './services/icp/OrderService';

export { Organization } from './entities/organization/Organization';
export { BroadedOrganization, OrganizationRole } from './entities/organization/BroadedOrganization';
export { NarrowedOrganization } from './entities/organization/NarrowedOrganization';
export { OrganizationDriver, OrganizationParams } from './drivers/icp/OrganizationDriver';
export { OrganizationService } from './services/icp/OrganizationService';

// export {createActor} from 'icp-declarations/entity_manager'
export { AuthenticationDriver as ICPAuthenticationDriver } from './drivers/icp/AuthenticationDriver';
export { AuthenticationService as ICPAuthenticationService } from './services/icp/AuthenticationService';

export { OfferDriver as ICPOfferDriver } from './drivers/icp/OfferDriver';
export { OfferService as ICPOfferService } from './services/icp/OfferService';

export { ProductCategoryDriver as ICPProductCategoryDriver } from './drivers/icp/ProductCategoryDriver';
export { ProductCategoryService as ICPProductCategoryService } from './services/icp/ProductCategoryService';

export { MaterialDriver as ICPMaterialDriver } from './drivers/icp/MaterialDriver';
export { MaterialService as ICPMaterialService } from './services/icp/MaterialService';

// Errors
export {
    NotAuthenticatedError,
    NotAuthorizedError,
    NotValidCredentialError
} from './entities/icp/errors';
export * from '@kbc-lib/azle-types';
