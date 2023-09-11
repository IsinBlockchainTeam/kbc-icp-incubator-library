import { Blob } from 'buffer';
import { IPFSService } from '@blockchain-lib/common';
import { Document } from './Document';

// jest.mock('@blockchain-lib/common', () => ({
//     PinataIPFSDriver: jest.fn(),
//     IPFSService: jest.fn(),
// }));
describe('Document', () => {
    let document: Document;
    const metadataExternalUrl = 'CID';
    const fileExternalUrl = 'CID_file_blob';
    const ipfsServiceRetrieveJSON = jest.spyOn(IPFSService.prototype, 'retrieveJSON');
    const ipfsServiceRetrieveFile = jest.spyOn(IPFSService.prototype, 'retrieveFile');
    const documentBlob = new Blob(['b', 'l', 'o', 'b']);

    ipfsServiceRetrieveJSON.mockResolvedValue({ fileUrl: fileExternalUrl });
    ipfsServiceRetrieveFile.mockResolvedValue(documentBlob);

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
        expect(ipfsServiceRetrieveJSON).toHaveBeenCalledTimes(1);
        expect(ipfsServiceRetrieveJSON).toHaveBeenNthCalledWith(1, 'CID');

        expect(ipfsServiceRetrieveFile).toHaveBeenCalledTimes(1);
        expect(ipfsServiceRetrieveFile).toHaveBeenNthCalledWith(1, fileExternalUrl);
    });
});
