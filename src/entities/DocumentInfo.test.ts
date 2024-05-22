import { DocumentInfo } from './DocumentInfo';

describe('Document', () => {
    let documentInfo: DocumentInfo;

    beforeAll(() => {
        documentInfo = new DocumentInfo(0, 'metadataExternalUrl', 'contentHash', '0xuplaoer');
    });

    it('should correctly initialize a new DocumentInfo', () => {
        expect(documentInfo.id).toEqual(0);
        expect(documentInfo.externalUrl).toEqual('metadataExternalUrl');
        expect(documentInfo.contentHash).toEqual('contentHash');
        expect(documentInfo.uploadedBy).toEqual('0xuplaoer');
    });

    it('should correctly set the id', () => {
        documentInfo.id = 1;
        expect(documentInfo.id).toEqual(1);
    });

    it('should correctly set external url', () => {
        documentInfo.externalUrl = 'externalUrl Updated';
        expect(documentInfo.externalUrl).toEqual('externalUrl Updated');
    });

    it('should correctly set content hash', () => {
        documentInfo.contentHash = 'contentHash Updated';
        expect(documentInfo.contentHash).toEqual('contentHash Updated');
    });

    it('should correctly set uploaded by', () => {
        documentInfo.uploadedBy = '0xuploader Updated';
        expect(documentInfo.uploadedBy).toEqual('0xuploader Updated');
    });
});
