import { OrganizationRole } from '@kbc-lib/azle-types';
import { OrderParams } from '../../drivers/OrderDriver';
import { ETHEUREUM, USERS } from './constants';
import { EthereumHelper } from '../helpers/EthereumHelper';
import { DateHelper } from '../helpers/DateHelper';
import { OrganizationParams } from '../../drivers/OrganizationDriver';

export type ProductCategoryParams = {
    name: string;
};

export type MaterialParams = {
    name: string;
    productCategoryId: number;
    typology: string;
    quality: string;
    moisture: string;
    isInput: boolean;
};

export type ShipmentDetailsParams = {
    shipmentNumber: number;
    expirationDate: Date;
    fixingDate: Date;
    targetExchange: string;
    differentialApplied: number;
    price: number;
    quantity: number;
    containersNumber: number;
    netWeight: number;
    grossWeight: number;
};

export type DocumentParams = {
    name: string;
    type: string;
    path: string;
};

export const mockProductCategories: ProductCategoryParams[] = [
    {
        name: 'Ethiopian Yirgacheffe'
    },
    {
        name: 'Colombian Supremo'
    }
];

export const mockMaterials: MaterialParams[] = [
    {
        name: 'Ethiopian Yirgacheffe',
        productCategoryId: 0,
        typology: 'Arabica',
        quality: '92+',
        moisture: '11% - 12%',
        isInput: false
    },
    {
        name: 'Colombian Supremo',
        productCategoryId: 1,
        typology: 'Robusta',
        quality: '85',
        moisture: '10% - 11%',
        isInput: false
    },
    {
        name: 'Ethiopian coffee',
        productCategoryId: 0,
        typology: 'Arabica',
        quality: 'High',
        moisture: '11% - 12%',
        isInput: true
    },
    {
        name: 'Colombian coffee',
        productCategoryId: 1,
        typology: 'Robusta',
        quality: 'High',
        moisture: '10% - 11%',
        isInput: true
    },
    {
        name: 'Vietnamese Robusta',
        productCategoryId: 3,
        typology: 'Robusta',
        quality: 'Medium',
        moisture: '12% - 13%',
        isInput: true
    },
    {
        name: 'Brazilian Santos',
        productCategoryId: 4,
        typology: 'Arabica',
        quality: '88+',
        moisture: '11% - 12%',
        isInput: true
    },
    {
        name: 'Mixed Blend Coffee (Vietnamese & Brazilian)',
        productCategoryId: 2,
        typology: 'Arabica',
        quality: '90+',
        moisture: '10.5% - 11.5%',
        isInput: false
    },
    {
        name: 'Kenyan AA',
        productCategoryId: 2,
        typology: 'Robusta',
        quality: '89',
        moisture: '10.5% - 11.5%',
        isInput: true
    },
];

const company1EthAddress = EthereumHelper.getAddressFromPrivateKey(USERS.COMPANY1_PRIVATE_KEY);
const company2EthAddress = EthereumHelper.getAddressFromPrivateKey(USERS.COMPANY2_PRIVATE_KEY);
const paymentDeadline = DateHelper.addDaysToDate(7);
const documentDeliveryDeadline = DateHelper.addDaysToDate(14);
const shippingDeadline = DateHelper.addDaysToDate(30);
const deliveryDeadline = DateHelper.addDaysToDate(60);

export const mockOrder = (
    supplierMaterialId: number,
    commissionerMaterialId: number
): OrderParams => ({
    supplier: company1EthAddress,
    customer: company2EthAddress,
    commissioner: company2EthAddress,
    paymentDeadline,
    documentDeliveryDeadline,
    shippingDeadline,
    deliveryDeadline,
    arbiter: 'Arbiter',
    token: ETHEUREUM.TOKEN_ADDRESS,
    agreedAmount: 10,
    incoterms: 'FOB',
    shipper: 'Maersk Line',
    shippingPort: 'Cartagena, Colombia',
    deliveryPort: 'Hamburg, Germany',
    lines: [
        {
            supplierMaterialId,
            commissionerMaterialId,
            quantity: 10,
            unit: 'KGM - Kilograms',
            price: {
                amount: 1.25,
                fiat: 'USD'
            }
        }
    ]
});

export const mockOrganizations: OrganizationParams[] = [
    {
        legalName: 'Colombian Coffee Exporters S.A.',
        industrialSector: 'Coffee Production & Export',
        address: 'Calle 72 #10-07',
        city: 'Bogotá',
        postalCode: '110231',
        region: 'Cundinamarca',
        countryCode: 'CO',
        role: OrganizationRole.EXPORTER,
        telephone: '+57-1-234-5678',
        email: 'contact@colombiancoffee.co',
        image: 'https://1000logos.net/wp-content/uploads/2024/02/Dunder-Mifflin-Logo.png'
    },
    {
        legalName: 'Global Coffee Imports GmbH',
        industrialSector: 'Coffee & Tea Processing',
        address: 'Hafenstrasse 123',
        city: 'Hamburg',
        postalCode: '20457',
        region: 'Hamburg',
        countryCode: 'DE',
        role: OrganizationRole.IMPORTER,
        telephone: '+49-40-555-0123',
        email: 'info@globalcoffeeimports.de',
        image: 'https://gioconda.supsi.ch/images/ISIN_logo.jpg'
    }
];

export const mockDocument: DocumentParams = {
    name: 'sampleDocument.pdf',
    type: 'application/pdf',
    path: '__shared__/constants/samplePdf.pdf'
};

export const mockShipmentDetails: ShipmentDetailsParams[] = [
    {
        shipmentNumber: 12345,
        expirationDate: shippingDeadline,
        fixingDate: deliveryDeadline,
        targetExchange: 'NYBOT',
        differentialApplied: 0,
        price: 3250,
        quantity: 350,
        containersNumber: 5,
        netWeight: 17500,
        grossWeight: 18200
    }
];
