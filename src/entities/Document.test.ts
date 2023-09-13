import { Document } from './Document';
import { DocumentInfo } from './DocumentInfo';

describe('Document', () => {
    let document: Document;
    let documentInfo: DocumentInfo;
    const filename = 'filename1.pdf';
    const content = new Blob(['b', 'l', 'o', 'b']);

    beforeAll(() => {
        documentInfo = new DocumentInfo(0, 'owner', 1, 'doc name', 'doc type', 'external url');
        document = new Document(documentInfo, filename, content);
    });

    it('should correctly initialize a new DocumentFile', () => {
        expect(document.id).toEqual(0);
        expect(document.owner).toEqual('owner');
        expect(document.transactionId).toEqual(1);
        expect(document.name).toEqual('doc name');
        expect(document.documentType).toEqual('doc type');
        expect(document.externalUrl).toEqual('external url');
        expect(document.filename).toEqual(filename);
        expect(document.content.size).toEqual(content.size);
        expect(document.content.type).toEqual(content.type);
    });

    it('should correctly set the filename', () => {
        document.filename = 'new filename';
        expect(document.filename).toEqual('new filename');
    });

    it('should correctly set the content', () => {
        const newContent = new Blob(['1', '2']);
        document.content = newContent;
        expect(document.content.size).toEqual(newContent.size);
        expect(document.content.type).toEqual(newContent.type);
    });
});
