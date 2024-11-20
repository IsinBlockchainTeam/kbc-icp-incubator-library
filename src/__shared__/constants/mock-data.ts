import { OrganizationRole } from '@isinblockchainteam/azle-types';
import { OrderParams } from '../../drivers/OrderDriver';
import { ETHEUREUM, USERS } from './constants';
import { EthereumHelper } from '../helpers/EthereumHelper';
import { DateHelper } from '../helpers/DateHelper';
import { OrganizationParams } from '../../drivers/OrganizationDriver';

export type ProductCategoryParams = {
    name: string;
    quality: number;
    description: string;
};

export const mockProductCategories: ProductCategoryParams[] = [
    {
        name: 'Ethiopian Yirgacheffe',
        quality: 92,
        description:
            'Light-bodied coffee with bright acidity, featuring distinctive floral and citrus notes. Known for its complex flavor profile with hints of bergamot and jasmine.'
    },
    {
        name: 'Colombian Supremo',
        quality: 85,
        description:
            'Medium-bodied coffee with sweet caramel undertones, balanced acidity, and hints of toasted nuts. Features a smooth chocolate finish and subtle fruity notes.'
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
        image: '/company-logos/gci-logo.png'
    },
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
        image: '/company-logos/cce-logo.png'
    }
];
