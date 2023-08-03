import { Relationship } from './Relationship';

describe('Relationship', () => {
    let relationship: Relationship;
    const now = new Date();

    beforeAll(() => {
        relationship = new Relationship(0, 'companyA', 'companyB', now, new Date('2030-10-10'));
    });

    it('should correctly initialize a new Relationship', () => {
        expect(relationship.id).toEqual(0);
        expect(relationship.companyA).toEqual('companyA');
        expect(relationship.companyB).toEqual('companyB');
        expect(relationship.validFrom).toEqual(now);
        expect(relationship.validUntil).toEqual(new Date('2030-10-10'));
    });

    it('should correctly initialize a new Relationship without validUntil date', () => {
        const newRelationship = new Relationship(0, 'companyA', 'companyB', now);
        expect(newRelationship.id).toEqual(0);
        expect(newRelationship.companyA).toEqual('companyA');
        expect(newRelationship.companyB).toEqual('companyB');
        expect(newRelationship.validFrom).toEqual(now);
        expect(newRelationship.validUntil).toBeUndefined();
    });

    it('should correctly set the id', () => {
        relationship.id = 1;
        expect(relationship.id).toEqual(1);
    });

    it('should correctly set the companyA', () => {
        relationship.companyA = 'companyAAA';
        expect(relationship.companyA).toEqual('companyAAA');
    });

    it('should correctly set the companyB', () => {
        relationship.companyB = 'companyBBB';
        expect(relationship.companyB).toEqual('companyBBB');
    });

    it('should correctly set validFrom date', () => {
        relationship.validFrom = new Date('2010-10-10');
        expect(relationship.validFrom).toEqual(new Date('2010-10-10'));
    });

    it('should correctly set the validUntil date', () => {
        relationship.validUntil = new Date('2050-10-10');
        expect(relationship.validUntil).toEqual(new Date('2050-10-10'));
    });
});
