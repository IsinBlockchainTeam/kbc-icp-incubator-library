import { OrderMetadata } from './OrderMetadata';

describe('OrderMetadata', () => {
    let orderMetadata: OrderMetadata;
    const issueDate = new Date();

    beforeAll(() => {
        orderMetadata = new OrderMetadata(issueDate);
    });

    it('should correctly initialize a new OrderMetadata', () => {
        expect(orderMetadata.issueDate).toEqual(issueDate);
    });
});
