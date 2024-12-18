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
    productCategoryId: number;
    typology: string;
    quality: string;
    moisture: string;
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
    content: Uint8Array;
};

export const mockProductCategories: ProductCategoryParams[] = [
    {
        name: 'Ethiopian Yirgacheffe',
    },
    {
        name: 'Colombian Supremo',
    }
];

export const mockMaterial: MaterialParams[] = [
    {
        productCategoryId: 0,
        typology: 'Arabica',
        quality: '92+',
        moisture: '11% - 12%'
    },
    {
        productCategoryId: 1,
        typology: 'Robusta',
        quality: '85',
        moisture: '10% - 11%'
    }
];

const company1EthAddress = EthereumHelper.getAddressFromPrivateKey(USERS.COMPANY1_PRIVATE_KEY);
const company2EthAddress = EthereumHelper.getAddressFromPrivateKey(USERS.COMPANY2_PRIVATE_KEY);
const paymentDeadline = DateHelper.addDaysToDate(7);
const documentDeliveryDeadline = DateHelper.addDaysToDate(14);
const shippingDeadline = DateHelper.addDaysToDate(30);
const deliveryDeadline = DateHelper.addDaysToDate(60);

export const mockOrder = (productCategoryId: number): OrderParams => ({
    supplier: company1EthAddress,
    customer: company2EthAddress,
    commissioner: company2EthAddress,
    paymentDeadline,
    documentDeliveryDeadline,
    shippingDeadline,
    deliveryDeadline,
    arbiter: company2EthAddress,
    token: ETHEUREUM.TOKEN_ADDRESS,
    agreedAmount: 10,
    incoterms: 'FOB',
    shipper: 'Maersk Line',
    shippingPort: 'Cartagena, Colombia',
    deliveryPort: 'Hamburg, Germany',
    lines: [
        {
            productCategoryId,
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
    content: new Uint8Array()
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
