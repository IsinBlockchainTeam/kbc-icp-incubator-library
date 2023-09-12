import { Blob } from 'buffer';
import { IPFSService } from '@blockchain-lib/common';
import { Document } from './Document';

describe('Document', () => {
    let document: Document;
    const metadataExternalUrl = 'CID';
    const fileExternalUrl = 'CID_file_blob';
    const ipfsServiceRetrieveJSONSpy = jest.spyOn(IPFSService.prototype, 'retrieveJSON');
    const ipfsServiceRetrieveFileSpy = jest.spyOn(IPFSService.prototype, 'retrieveFile');
    const documentBlob = new Blob(['b', 'l', 'o', 'b']);

    ipfsServiceRetrieveJSONSpy.mockResolvedValue({ fileUrl: fileExternalUrl });
    ipfsServiceRetrieveFileSpy.mockResolvedValue(documentBlob);

    // mockedIpfsService.retrieveJSON = jest.fn().mockResolvedValue({ fileUrl: fileExternalUrl });
    // mockedIpfsService.retrieveFile = jest.fn().mockResolvedValue(new Blob(['b', 'l', 'o', 'b']));

    beforeAll(() => {
        document = new Document(0, 'owner', 1, 'doc name', 'doc type', metadataExternalUrl);
    });

    it('should correctly initialize a new Document', () => {
        expect(document.id).toEqual(0);
        expect(document.owner).toEqual('owner');
        expect(document.transactionId).toEqual(1);
        expect(document.name).toEqual('doc name');
        expect(document.documentType).toEqual('doc type');
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

    it('should correctly get the file asynchronously', async () => {
        const documentFile = await document.file;
        expect(documentFile).toBeDefined();
        expect(documentFile!.content.size).toEqual(documentBlob.size);
        expect(ipfsServiceRetrieveJSONSpy).toHaveBeenCalledTimes(1);
        expect(ipfsServiceRetrieveJSONSpy).toHaveBeenNthCalledWith(1, metadataExternalUrl);

        expect(ipfsServiceRetrieveFileSpy).toHaveBeenCalledTimes(1);
        expect(ipfsServiceRetrieveFileSpy).toHaveBeenNthCalledWith(1, fileExternalUrl);
    });
});
