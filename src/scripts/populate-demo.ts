import { DocumentTypeEnum, EvaluationStatusEnum } from '@kbc-lib/azle-types';
import { ICPStorageDriver } from '@blockchain-lib/common';
import {
    mockDocumentUrl,
    mockOrder,
    mockOrganizations,
    mockProductCategories,
    mockShipmentDetails,
    ProductCategoryParams,
    ShipmentDetailsParams
} from '../__shared__/constants/mock-data';
import { ProductCategoryDriver } from '../drivers/icp/ProductCategoryDriver';
import { SiweIdentityProvider } from '../drivers/icp/SiweIdentityProvider';
import { ICP, USERS } from '../__shared__/constants/constants';
import { ProductCategory } from '../entities/ProductCategory';
import { AuthHelper, Login } from '../__shared__/helpers/AuthHelper';
import { MaterialDriver } from '../drivers/icp/MaterialDriver';
import { OfferDriver } from '../drivers/icp/OfferDriver';
import { OrderDriver, OrderParams } from '../drivers/icp/OrderDriver';
import { OrganizationDriver, OrganizationParams } from '../drivers/icp/OrganizationDriver';
import { Organization } from '../entities/organization/Organization';
import { Material } from '../entities/Material';
import { Offer } from '../entities/Offer';
import { Order } from '../entities/icp/Order';
import { ShipmentDriver } from '../drivers/icp/ShipmentDriver';
import { Shipment } from '../entities/icp/Shipment';
import { ShipmentService } from '../services/icp/ShipmentService';
import { ICPFileDriver } from '../drivers/ICPFileDriver';

const createProductCategory = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    params: ProductCategoryParams
): Promise<ProductCategory> => {
    console.log('Creating product category:', params.name);

    const productCategoryDriver = new ProductCategoryDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return productCategoryDriver.createProductCategory(
        params.name,
        params.quality,
        params.description
    );
};

const createMaterial = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    productCategoryId: number
) => {
    console.log('Creating material for product category:', productCategoryId);

    const materialDriver = new MaterialDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return materialDriver.createMaterial(productCategoryId);
};

const createOffer = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    productCategoryId: number
) => {
    console.log('Creating offer for product category:', productCategoryId);

    const offerDriver = new OfferDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return offerDriver.createOffer(productCategoryId);
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
    documentUrl: string,
    orderId: number
): Promise<Shipment> => {
    console.log('Uploading document:', documentTypeEnum);

    const shipmentDriver = new ShipmentDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );
    const icpStorageDriver = new ICPStorageDriver(
        userSiweIdentityProvider.identity,
        ICP.STORAGE_CANISTER_ID
    );
    const icpFileDriver = new ICPFileDriver(icpStorageDriver);
    const organizationId = 0;
    const baseExternalUrl = `https://${ICP.STORAGE_CANISTER_ID}.${ICP.NETWORK}/organization/${organizationId}/transactions/${orderId}`;
    const shipmentService = new ShipmentService(shipmentDriver, icpFileDriver, baseExternalUrl);

    return shipmentService.addDocument(shipmentId, documentTypeEnum, 0, documentUrl, [
        organizationId
    ]);

    // detailShipment.shipment.id,
    //     documentType,
    //     documentReferenceId,
    //     new Uint8Array(await new Response(fileContent).arrayBuffer()),
    //     resourceSpec,
    //     delegatedOrganizationIds
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
        mockDocumentUrl,
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

    const createdProductCategories: ProductCategory[] = await Promise.all(
        mockProductCategories.map(async (productCategoryParams) =>
            createProductCategory(exporter.siweIdentityProvider, productCategoryParams)
        )
    );

    const createdMaterials: Material[] = await Promise.all(
        createdProductCategories.map(async (productCategory) =>
            createMaterial(exporter.siweIdentityProvider, productCategory.id)
        )
    );

    const createdOffers: Offer[] = await Promise.all(
        createdProductCategories.map(async (productCategory) =>
            createOffer(exporter.siweIdentityProvider, productCategory.id)
        )
    );

    const createdOrganizations: Organization[] = [];
    createdOrganizations.push(
        await createOrganization(exporter.siweIdentityProvider, mockOrganizations[0])
    );
    createdOrganizations.push(
        await createOrganization(importer.siweIdentityProvider, mockOrganizations[1])
    );

    const createdOrders: Order[] = await Promise.all(
        createdProductCategories
            .slice(0, 1)
            .map(async (productCategory) =>
                createOrder(importer.siweIdentityProvider, mockOrder(productCategory.id))
            )
    );

    await Promise.all(
        createdOrders.map(async (order) =>
            completeOrder(exporter.siweIdentityProvider, importer.siweIdentityProvider, order.id)
        )
    );
};

main().catch(console.error);
