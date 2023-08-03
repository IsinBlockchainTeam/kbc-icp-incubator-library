import { IdentityEthersDriver } from '@blockchain-lib/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import RelationshipService from '../services/RelationshipService';
import { RelationshipDriver } from '../drivers/RelationshipDriver';
import {
    CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_PRIVATE_KEY,
    NETWORK, OTHER_INVOKER_ADDRESS, OTHER_INVOKER_PRIVATE_KEY,
    RELATIONSHIP_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';

describe('Relationship lifecycle', () => {
    let relationshipService: RelationshipService;
    let relationshipDriver: RelationshipDriver;
    let identityDriver: IdentityEthersDriver;
    let provider: JsonRpcProvider;

    let relationshipCounterId = 0;
    const validFrom = new Date();
    const validUntil = new Date('2030-10-10');

    const _defineSender = (senderPrivateKey: string) => {
        identityDriver = new IdentityEthersDriver(senderPrivateKey, provider);
        relationshipDriver = new RelationshipDriver(
            identityDriver,
            provider,
            RELATIONSHIP_MANAGER_CONTRACT_ADDRESS,
        );
        relationshipService = new RelationshipService(relationshipDriver);
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);
    });

    it('Should correctly register and retrieve a relationship ', async () => {
        await relationshipService.registerRelationship(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, validFrom, validUntil);
        relationshipCounterId = await relationshipService.getRelationshipCounter();

        const savedRelationship = await relationshipService.getRelationshipInfo(relationshipCounterId);
        expect(savedRelationship).toBeDefined();
        expect(savedRelationship.id).toEqual(relationshipCounterId);
        expect(savedRelationship.companyA).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedRelationship.companyB).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedRelationship.validFrom).toEqual(validFrom);
        expect(savedRelationship.validUntil).toEqual(validUntil);
    });

    it('Should insert a relation by companyA that is visible also for companyB', async () => {
        await relationshipService.registerRelationship(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, validFrom, validUntil);
        relationshipCounterId = await relationshipService.getRelationshipCounter();
        const savedRelationship = await relationshipService.getRelationshipInfo(relationshipCounterId);

        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);
        const sharedRelationship = await relationshipService.getRelationshipInfo(relationshipCounterId);
        expect(savedRelationship).toBeDefined();
        expect(savedRelationship).toEqual(sharedRelationship);
    });

    it('Should get relationships by company address', async () => {
        _defineSender(OTHER_INVOKER_PRIVATE_KEY);
        await relationshipService.registerRelationship(OTHER_INVOKER_ADDRESS, SUPPLIER_INVOKER_ADDRESS, validFrom, validUntil);
        await relationshipService.registerRelationship(OTHER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, validFrom, validUntil);
        relationshipCounterId = await relationshipService.getRelationshipCounter();

        const relationshipIds = await relationshipService.getRelationshipIdsByCompany(OTHER_INVOKER_ADDRESS);
        expect(relationshipIds.length).toEqual(relationshipCounterId);
        let savedRelationship = await relationshipService.getRelationshipInfo(relationshipIds[0]);
        expect(savedRelationship.companyA).toEqual(SUPPLIER_INVOKER_ADDRESS);

        savedRelationship = await relationshipService.getRelationshipInfo(relationshipIds[1]);
        expect(savedRelationship.companyB).toEqual(CUSTOMER_INVOKER_ADDRESS);
    });
});
