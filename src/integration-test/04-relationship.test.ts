import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import RelationshipService from '../services/RelationshipService';
import { RelationshipDriver } from '../drivers/RelationshipDriver';
import {
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    NETWORK,
    OTHER_ADDRESS,
    OTHER_PRIVATE_KEY,
    RELATIONSHIP_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY
} from './constants/ethereum';

describe('Relationship lifecycle', () => {
    let relationshipService: RelationshipService;
    let relationshipDriver: RelationshipDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;

    let relationshipCounterId = 0;
    const validFrom = new Date();
    const validUntil = new Date('2030-10-10');

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        relationshipDriver = new RelationshipDriver(signer, RELATIONSHIP_MANAGER_CONTRACT_ADDRESS);
        relationshipService = new RelationshipService(relationshipDriver);
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_PRIVATE_KEY);
    });

    it('Should correctly register and retrieve a relationship ', async () => {
        await relationshipService.registerRelationship(
            SUPPLIER_ADDRESS,
            CUSTOMER_ADDRESS,
            validFrom,
            validUntil
        );
        relationshipCounterId = await relationshipService.getRelationshipCounter();

        const savedRelationship =
            await relationshipService.getRelationshipInfo(relationshipCounterId);
        expect(savedRelationship).toBeDefined();
        expect(savedRelationship.id).toEqual(relationshipCounterId);
        expect(savedRelationship.companyA).toEqual(SUPPLIER_ADDRESS);
        expect(savedRelationship.companyB).toEqual(CUSTOMER_ADDRESS);
        expect(savedRelationship.validFrom).toEqual(validFrom);
        expect(savedRelationship.validUntil).toEqual(validUntil);
    });

    it('Should insert a relation by companyA that is visible also for companyB', async () => {
        await relationshipService.registerRelationship(
            SUPPLIER_ADDRESS,
            CUSTOMER_ADDRESS,
            validFrom,
            validUntil
        );
        relationshipCounterId = await relationshipService.getRelationshipCounter();
        const savedRelationship =
            await relationshipService.getRelationshipInfo(relationshipCounterId);

        _defineSender(CUSTOMER_PRIVATE_KEY);
        const sharedRelationship =
            await relationshipService.getRelationshipInfo(relationshipCounterId);
        expect(savedRelationship).toBeDefined();
        expect(savedRelationship).toEqual(sharedRelationship);
    });

    it('Should get relationships by company address', async () => {
        _defineSender(OTHER_PRIVATE_KEY);
        const oldRelationshipCounterId = await relationshipService.getRelationshipCounter();
        await relationshipService.registerRelationship(
            OTHER_ADDRESS,
            SUPPLIER_ADDRESS,
            validFrom,
            validUntil
        );
        await relationshipService.registerRelationship(
            OTHER_ADDRESS,
            CUSTOMER_ADDRESS,
            validFrom,
            validUntil
        );
        relationshipCounterId = await relationshipService.getRelationshipCounter();

        const relationshipIds =
            await relationshipService.getRelationshipIdsByCompany(OTHER_ADDRESS);
        expect(relationshipIds.length).toEqual(relationshipCounterId - oldRelationshipCounterId);
        let savedRelationship = await relationshipService.getRelationshipInfo(
            relationshipIds[relationshipCounterId - oldRelationshipCounterId - 2]
        );
        expect(savedRelationship.companyB).toEqual(SUPPLIER_ADDRESS);

        savedRelationship = await relationshipService.getRelationshipInfo(
            relationshipIds[relationshipCounterId - oldRelationshipCounterId - 1]
        );
        expect(savedRelationship.companyB).toEqual(CUSTOMER_ADDRESS);
    });
});
