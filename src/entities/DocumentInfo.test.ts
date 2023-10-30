import { DocumentInfo } from './DocumentInfo';

describe('Document', () => {
    let documentInfo: DocumentInfo;

    beforeAll(() => {
        documentInfo = new DocumentInfo(0, 1, 'doc name', 'doc type', 'metadataExternalUrl');
    });

    it('should correctly initialize a new DocumentInfo', () => {
        expect(documentInfo.id).toEqual(0);
        expect(documentInfo.transactionId).toEqual(1);
        expect(documentInfo.name).toEqual('doc name');
        expect(documentInfo.documentType).toEqual('doc type');
    });

    it('should correctly set the id', () => {
        documentInfo.id = 1;
        expect(documentInfo.id).toEqual(1);
    });

    it('should correctly set the transactionId', () => {
        documentInfo.transactionId = 2;
        expect(documentInfo.transactionId).toEqual(2);
    });

    it('should correctly set name', () => {
        documentInfo.name = 'doc name 2';
        expect(documentInfo.name).toEqual('doc name 2');
    });

    it('should correctly set the documentInfo type', () => {
        documentInfo.documentType = 'doc type 2';
        expect(documentInfo.documentType).toEqual('doc type 2');
    });

    it('should correctly set external url', () => {
        documentInfo.externalUrl = 'externalUrl Updated';
        expect(documentInfo.externalUrl).toEqual('externalUrl Updated');
    });
});
