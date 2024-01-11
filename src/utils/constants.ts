import { checkAndGetEnvironmentVariable } from './utils';

export const envVariables = {
    PINATA_API_KEY: () => checkAndGetEnvironmentVariable(process.env.PINATA_API_KEY, 'Pinata API key must be defined'),
    PINATA_SECRET_API_KEY: () => checkAndGetEnvironmentVariable(process.env.PINATA_SECRET_API_KEY, 'Pinata secret API key must be defined'),
};

export enum FIAT {
    USD = 'USD',
    EUR = 'EUR',
    CHF = 'CHF',
}

export enum PRODUCT_CATEGORY {
    ARABIC_85 = 'Arabic 85',
    ARABIC_85_SUPERIOR = 'Arabic 85 Superior',
    EXCELSA_88 = 'Excelsa 88',
    LIBERICA_85 = 'Liberica 85',
    ROBUSTA_87 = 'Robusta 87'
}

export enum TRANSACTION_TYPE {
    TRADE = 'trade',
    TRANSFORMATION = 'transformation',
    CERTIFICATION = 'certification'
}
