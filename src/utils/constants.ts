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


export enum TRANSACTION_TYPE {
    TRADE = 'trade',
    TRANSFORMATION = 'transformation',
    CERTIFICATION = 'certification'
}
