import { DocumentTypeEnum, EvaluationStatusEnum } from '@kbc-lib/azle-types';
import * as fs from 'node:fs';
import {
    DocumentParams,
    mockDocument,
    mockOrder,
    mockMaterials,
    mockOrganizations,
    mockShipmentDetails,
    ShipmentDetailsParams
} from '../__shared__/constants/mock-data';
import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { SiweIdentityProvider } from '../drivers/SiweIdentityProvider';
import { ICP, USERS } from '../__shared__/constants/constants';
import { ProductCategory } from '../entities/ProductCategory';
import { AuthHelper, Login } from '../__shared__/helpers/AuthHelper';
import { Organization } from '../entities/organization/Organization';
import { Material } from '../entities/Material';
import { Offer } from '../entities/Offer';
import { FileDriver } from '../drivers/FileDriver';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { OfferDriver } from '../drivers/OfferDriver';
import { OrganizationDriver, OrganizationParams } from '../drivers/OrganizationDriver';
import { OrderDriver, OrderParams } from '../drivers/OrderDriver';
import { Shipment } from '../entities/Shipment';
import { ShipmentDriver } from '../drivers/ShipmentDriver';
import { ShipmentService } from '../services/ShipmentService';
import { Order } from '../entities/Order';
import { StorageDriver } from '../drivers/StorageDriver';
import { ResourceSpec } from '../types/ResourceSpec';
import { BusinessRelationDriver } from '../drivers/BusinessRelationDriver';
import { AssetOperationDriver, AssetOperationParams } from '../drivers/AssetOperationDriver';
import { AssetOperation } from '../entities/AssetOperation';
import { CertificationDriver } from '../drivers/CertificationDriver';
import { CertificateDocumentType } from '../entities/Certificate';
import { CertificationService } from '../services/CertificationService';
import { URLStructure } from '../types/URLStructure';

const getProductCategories = async (
    userSiweIdentityProvider: SiweIdentityProvider
): Promise<ProductCategory[]> => {
    const productCategoryDriver = new ProductCategoryDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return productCategoryDriver.getProductCategories();
};

const createMaterial = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    name: string,
    productCategoryId: number,
    typology: string,
    quality: string,
    moisture: string,
    isInput: boolean
) => {
    console.log('Creating material for product category:', productCategoryId);

    const materialDriver = new MaterialDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return materialDriver.createMaterial(
        name,
        productCategoryId,
        typology,
        quality,
        moisture,
        isInput
    );
};

const createAssetOperation = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    params: AssetOperationParams
) => {
    console.log('Creating asset operation:', params.name);

    const assetOperationDriver = new AssetOperationDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return assetOperationDriver.createAssetOperation(params);
};

const createOffer = async (userSiweIdentityProvider: SiweIdentityProvider, materialId: number) => {
    console.log('Creating offer for material id:', materialId);

    const offerDriver = new OfferDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return offerDriver.createOffer(materialId);
};

const createOrganization = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    params: OrganizationParams
) => {
    console.log('Creating organization:', params.legalName);

    const organizationDriver = new OrganizationDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return organizationDriver.createOrganization(params);
};

const discloseOrganization = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    ethAddress: string
) => {
    console.log('Disclosing information to company:', ethAddress);

    const businessDriver = new BusinessRelationDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return businessDriver.createBusinessRelation(ethAddress);
};

const createOrder = async (userSiweIdentityProvider: SiweIdentityProvider, params: OrderParams) => {
    console.log('Creating order between:', params.supplier, params.customer);

    const orderDriver = new OrderDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return orderDriver.createOrder(params);
};

const signOrder = async (userSiweIdentityProvider: SiweIdentityProvider, orderId: number) => {
    console.log('Signing order:', orderId);

    const orderDriver = new OrderDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    await orderDriver.signOrder(orderId);
};

const uploadDocument = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    documentTypeEnum: DocumentTypeEnum,
    document: DocumentParams,
    orderId: number
): Promise<Shipment> => {
    console.log('Uploading document:', documentTypeEnum);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );
    const icpStorageDriver = new StorageDriver(
        userSiweIdentityProvider.identity,
        ICP.STORAGE_CANISTER_ID,
        ICP.NETWORK
    );
    const icpFileDriver = new FileDriver(icpStorageDriver);
    const organizationId = 0;
    const baseExternalUrl = `https://${ICP.STORAGE_CANISTER_ID}.${ICP.NETWORK}/organization/${organizationId}/transactions/${orderId}`;
    const shipmentService = new ShipmentService(shipmentDriver, icpFileDriver, baseExternalUrl);

    const fileSpec: ResourceSpec = {
        name: document.name,
        type: document.type
    };

    const fileBuffer = fs.readFileSync(document.path);

    return shipmentService.addDocument(
        shipmentId,
        documentTypeEnum,
        '0',
        new Uint8Array(fileBuffer),
        fileSpec,
        [organizationId]
    );
};

const approveDocument = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    documentId: number
) => {
    console.log('Approving document:', documentId);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    await shipmentDriver.evaluateDocument(shipmentId, documentId, EvaluationStatusEnum.APPROVED);
};

const uploadAndApproveDocument = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    documentTypeEnum: DocumentTypeEnum,
    shipmentId: number,
    orderId: number
) => {
    const shipment = await uploadDocument(
        supplierSiweIdentityProvider,
        shipmentId,
        documentTypeEnum,
        mockDocument,
        orderId
    );
    await approveDocument(
        customerSiweIdentityProvider,
        shipmentId,
        shipment.documents.get(documentTypeEnum)![0].id
    );
};

const evaluateSample = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number
) => {
    console.log('Evaluating sample:', shipmentId);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    await shipmentDriver.evaluateSample(shipmentId, EvaluationStatusEnum.APPROVED);
};

const setShipmentDetails = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    params: ShipmentDetailsParams
): Promise<Shipment> => {
    console.log('Setting shipment details:', shipmentId);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return shipmentDriver.setShipmentDetails(
        shipmentId,
        shipmentId,
        params.expirationDate,
        params.fixingDate,
        params.targetExchange,
        params.differentialApplied,
        params.price,
        params.quantity,
        params.containersNumber,
        params.netWeight,
        params.grossWeight
    );
};

const approveShipmentDetails = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number
) => {
    console.log('Approving shipment details:', shipmentId);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    await shipmentDriver.evaluateShipmentDetails(shipmentId, EvaluationStatusEnum.APPROVED);
};

const uploadAndApproveShipmentDetails = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number
) => {
    const shipment = await setShipmentDetails(
        supplierSiweIdentityProvider,
        shipmentId,
        mockShipmentDetails[0]
    );
    await approveShipmentDetails(customerSiweIdentityProvider, shipmentId);
};

const completeSampleApprovalStep = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    orderId: number
) => {
    const documents = [DocumentTypeEnum.PRE_SHIPMENT_SAMPLE];

    await Promise.all(
        documents.map(async (document) => {
            await uploadAndApproveDocument(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                document,
                shipmentId,
                orderId
            );
        })
    );

    await evaluateSample(customerSiweIdentityProvider, shipmentId);
};

const completeShipmentConfirmationStep = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    orderId: number
) => {
    const documents = [DocumentTypeEnum.SHIPPING_INSTRUCTIONS, DocumentTypeEnum.SHIPPING_NOTE];

    await Promise.all(
        documents.map(async (document) => {
            await uploadAndApproveDocument(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                document,
                shipmentId,
                orderId
            );
        })
    );

    await uploadAndApproveShipmentDetails(
        supplierSiweIdentityProvider,
        customerSiweIdentityProvider,
        shipmentId
    );
};

const completeWaitingForLandTransportationStep = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    orderId: number
) => {
    const documents = [DocumentTypeEnum.BOOKING_CONFIRMATION];

    await Promise.all(
        documents.map(async (document) => {
            await uploadAndApproveDocument(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                document,
                shipmentId,
                orderId
            );
        })
    );
};

const completeShipment = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    shipmentId: number,
    orderId: number
) => {
    const shipmentDriver = new ShipmentDriver(
        supplierSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    const shipmentSteps = [
        () =>
            completeSampleApprovalStep(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                shipmentId,
                orderId
            ),
        () =>
            completeShipmentConfirmationStep(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                shipmentId,
                orderId
            ),
        () =>
            completeWaitingForLandTransportationStep(
                supplierSiweIdentityProvider,
                customerSiweIdentityProvider,
                shipmentId,
                orderId
            )
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const step of shipmentSteps) {
        // eslint-disable-next-line no-await-in-loop
        console.log(await shipmentDriver.getShipmentPhase(shipmentId));

        // eslint-disable-next-line no-await-in-loop
        await step();
    }
};

const completeOrder = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    orderId: number
) => {
    console.log('Completing order:', orderId);

    await signOrder(supplierSiweIdentityProvider, orderId);

    const orderDriver = new OrderDriver(
        supplierSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    const order = await orderDriver.getOrder(orderId);
    const shipment = order.shipment;
    if (!shipment) {
        throw new Error('Shipment not found');
    }

    await completeShipment(
        supplierSiweIdentityProvider,
        customerSiweIdentityProvider,
        shipment.id,
        orderId
    );
};

const createCompanyCertification = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    issuer: string,
    subject: string,
    assessmentReferenceStandardId: number,
    assessmentAssuranceLevel: string,
    document: DocumentParams,
    validFrom: Date,
    validUntil: Date,
    notes?: string
) => {
    console.log(
        `Creating certification for company with address ${subject} by ${issuer} valid from ${validFrom.toLocaleDateString()} to ${validUntil.toLocaleDateString()}`
    );

    const certificationDriver = new CertificationDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );
    const icpStorageDriver = new StorageDriver(
        userSiweIdentityProvider.identity,
        ICP.STORAGE_CANISTER_ID,
        ICP.NETWORK
    );
    const icpFileDriver = new FileDriver(icpStorageDriver);
    const certificationService = new CertificationService(certificationDriver, icpFileDriver);

    const urlStructure: URLStructure = {
        prefix: `https://${ICP.STORAGE_CANISTER_ID}.${ICP.NETWORK}`,
        organizationId: 0
    };
    const resourceSpec: ResourceSpec = {
        name: document.name,
        type: document.type
    };
    const fileBuffer = fs.readFileSync(document.path);

    return certificationService.registerCompanyCertificate(
        issuer,
        subject,
        assessmentReferenceStandardId,
        assessmentAssuranceLevel,
        {
            referenceId: '12345',
            documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            filename: resourceSpec.name,
            fileType: resourceSpec.type,
            fileContent: new Uint8Array(fileBuffer),
            storageConfig: {
                urlStructure,
                resourceSpec,
                delegatedOrganizationIds: [1]
            }
        },
        validFrom,
        validUntil,
        notes
    );
};

const main = async () => {
    console.log('Logging in...');

    const exporter: Login = await AuthHelper.prepareLogin(
        USERS.USER1_PRIVATE_KEY,
        USERS.COMPANY1_PRIVATE_KEY
    );
    const importer: Login = await AuthHelper.prepareLogin(
        USERS.USER2_PRIVATE_KEY,
        USERS.COMPANY2_PRIVATE_KEY
    );

    await exporter.authenticate();
    await importer.authenticate();

    console.log('Logged');

    const productCategories: ProductCategory[] = await getProductCategories(
        exporter.siweIdentityProvider
    );

    const createdMaterials: Material[] = [];
    createdMaterials.push(
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[0].name,
            mockMaterials[0].productCategoryId,
            mockMaterials[0].typology,
            mockMaterials[0].quality,
            mockMaterials[0].moisture,
            mockMaterials[0].isInput
        ),
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[1].name,
            mockMaterials[1].productCategoryId,
            mockMaterials[1].typology,
            mockMaterials[1].quality,
            mockMaterials[1].moisture,
            mockMaterials[1].isInput
        ),
        await createMaterial(
            importer.siweIdentityProvider,
            mockMaterials[2].name,
            mockMaterials[2].productCategoryId,
            mockMaterials[2].typology,
            mockMaterials[2].quality,
            mockMaterials[2].moisture,
            mockMaterials[2].isInput
        ),
        await createMaterial(
            importer.siweIdentityProvider,
            mockMaterials[3].name,
            mockMaterials[3].productCategoryId,
            mockMaterials[3].typology,
            mockMaterials[3].quality,
            mockMaterials[3].moisture,
            mockMaterials[3].isInput
        ),
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[4].name,
            mockMaterials[4].productCategoryId,
            mockMaterials[4].typology,
            mockMaterials[4].quality,
            mockMaterials[4].moisture,
            mockMaterials[4].isInput
        ),
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[5].name,
            mockMaterials[5].productCategoryId,
            mockMaterials[5].typology,
            mockMaterials[5].quality,
            mockMaterials[5].moisture,
            mockMaterials[5].isInput
        ),
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[6].name,
            mockMaterials[6].productCategoryId,
            mockMaterials[6].typology,
            mockMaterials[6].quality,
            mockMaterials[6].moisture,
            mockMaterials[6].isInput
        ),
        await createMaterial(
            exporter.siweIdentityProvider,
            mockMaterials[7].name,
            mockMaterials[7].productCategoryId,
            mockMaterials[7].typology,
            mockMaterials[7].quality,
            mockMaterials[7].moisture,
            mockMaterials[7].isInput
        )
    );

    const createdAssetOperation: AssetOperation = await createAssetOperation(
        exporter.siweIdentityProvider,
        {
            name: 'Coffee Roasting',
            inputMaterialIds: [createdMaterials[4].id, createdMaterials[5].id],
            outputMaterialId: createdMaterials[6].id,
            latitude: '5.985',
            longitude: '9.3652',
            processTypes: ['37 - Manufacturing']
        }
    );

    const createdOffers: Offer[] = await Promise.all(
        createdMaterials
            .filter((material) => material.owner === exporter.companyWallet.address)
            .filter((material) => !material.isInput)
            .map(async (material) => createOffer(exporter.siweIdentityProvider, material.id))
    );

    const createdOrganizations: Organization[] = [];
    createdOrganizations.push(
        await createOrganization(exporter.siweIdentityProvider, mockOrganizations[0])
    );
    createdOrganizations.push(
        await createOrganization(importer.siweIdentityProvider, mockOrganizations[1])
    );

    const companyCertification = await createCompanyCertification(
        exporter.siweIdentityProvider,
        'Geo Trust',
        exporter.companyWallet.address,
        1,
        'Certified (Third Party)',
        mockDocument,
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 365))
    );

    const createdOrders: Order[] = [];
    createdOrders.push(
        await createOrder(
            importer.siweIdentityProvider,
            mockOrder(createdMaterials[0].id, createdMaterials[2].id)
        )
    );

    await createOrder(
        importer.siweIdentityProvider,
        mockOrder(createdMaterials[1].id, createdMaterials[3].id)
    );

    await discloseOrganization(importer.siweIdentityProvider, exporter.companyWallet.address);

    await Promise.all(
        createdOrders.map(async (order) =>
            completeOrder(exporter.siweIdentityProvider, importer.siweIdentityProvider, order.id)
        )
    );
};

main().catch(console.error);
