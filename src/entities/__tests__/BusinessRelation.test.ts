import { BusinessRelation } from '../BusinessRelation';

describe('BusinessRelation', () => {
    const ethAddressA = '0x1234567890123456789012345678901234567890';
    const ethAddressB = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    let businessRelation: BusinessRelation;

    beforeEach(() => {
        businessRelation = new BusinessRelation(ethAddressA, ethAddressB);
    });

    it('should create a business relation with two different ethereum addresses', () => {
        expect(businessRelation.ethAddressA).toBe(ethAddressA);
        expect(businessRelation.ethAddressB).toBe(ethAddressB);
    });

    it('should get ethAddress correctly', () => {
        expect(businessRelation.ethAddressA).toBe(ethAddressA);
        expect(businessRelation.ethAddressB).toBe(ethAddressB);
    });
});