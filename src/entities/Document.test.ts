import { Document } from './Document';

describe('Document', () => {
    let document: Document;

    beforeAll(() => {
        document = new Document(0, 'owner', 1, 'doc name', 'doc type', 'ext url');
    });

    it('should correctly initialize a new Document', () => {
        expect(document.id).toEqual(0);
        expect(document.owner).toEqual('owner');
        expect(document.transactionId).toEqual(1);
        expect(document.name).toEqual('doc name');
        expect(document.documentType).toEqual('doc type');
        expect(document.externalUrl).toEqual('ext url');
    });

    it('should correctly set the id', () => {
        document.id = 1;
        expect(document.id).toEqual(1);
    });

    it('should correctly set the owner', () => {
        document.owner = 'owner 2';
        expect(document.owner).toEqual('owner 2');
    });

    it('should correctly set the transactionId', () => {
        document.transactionId = 2;
        expect(document.transactionId).toEqual(2);
    });

    it('should correctly set name', () => {
        document.name = 'doc name 2';
        expect(document.name).toEqual('doc name 2');
    });

    it('should correctly set the document type', () => {
        document.documentType = 'doc type 2';
        expect(document.documentType).toEqual('doc type 2');
    });

    it('should correctly set the external url', () => {
        document.externalUrl = 'external url 2';
        expect(document.externalUrl).toEqual('external url 2');
    });
});
