import { Document, DocumentStatus } from './Document';
import { DocumentInfo, DocumentType } from './DocumentInfo';

describe('Document', () => {
    let document: Document;
    let documentInfo: DocumentInfo;
    const filename = 'filename1.pdf';
    const documentType: DocumentType = DocumentType.METADATA;
    const content = new Blob(['b', 'l', 'o', 'b']);
    const today = new Date();

    beforeAll(() => {
        documentInfo = new DocumentInfo(0, 'external url', 'contentHash', DocumentStatus.NOT_EVALUATED);
        document = new Document(documentInfo, filename, documentType, today, new Uint8Array([1, 2, 3]));
    });

    it('should correctly initialize a new DocumentFile', () => {
        expect(document.id).toEqual(0);
        expect(document.externalUrl).toEqual('external url');
        expect(document.contentHash).toEqual('contentHash');
        expect(document.status).toEqual(DocumentStatus.NOT_EVALUATED);
        expect(document.filename).toEqual(filename);
        expect(document.documentType).toEqual(documentType);
        expect(document.date).toEqual(today);
        expect(document.transactionLines).toBeUndefined();
        expect(document.quantity).toBeUndefined();
        expect(document.content).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('should correctly set the filename', () => {
        document.filename = 'new filename';
        expect(document.filename).toEqual('new filename');
    });

    it('should correctly set the content', () => {
        const newContent = new Uint8Array([4, 5, 6]);
        document.content = newContent;
        expect(document.content).toEqual(newContent);
    });

    it('should correctly set the status', () => {
        document.status = DocumentStatus.APPROVED;
        expect(document.status).toEqual(DocumentStatus.APPROVED);
    });

    it('should correctly set the document type', () => {
        document.documentType = DocumentType.DELIVERY_NOTE;
        expect(document.documentType).toEqual(DocumentType.DELIVERY_NOTE);
    });

    it('should correctly set the date', () => {
        document.date = new Date(today.getTime() + 10);
        expect(document.date).toEqual(new Date(today.getTime() + 10));
    });

    it('should correctly set the transaction lines', () => {
        document.transactionLines = [{ id: 1, quantity: 50 }, { id: 2 }];
        expect(document.transactionLines).toEqual([{ id: 1, quantity: 50 }, { id: 2 }]);
    });

    it('should correctly set the quantity', () => {
        document.quantity = 10.42;
        expect(document.quantity).toEqual(10.42);
    });
});
