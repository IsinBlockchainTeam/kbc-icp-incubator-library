import { Blob } from 'buffer';
import { Document } from './Document';
import { DocumentInfo } from './DocumentInfo';

describe('Document', () => {
    let document: Document;
    let documentInfo: DocumentInfo;
    const filename = 'filename1.pdf';
    const content = new Blob(['b', 'l', 'o', 'b']);
    const today = new Date();

    beforeAll(() => {
        documentInfo = new DocumentInfo(0, 'external url', 'contentHash');
        document = new Document(documentInfo, filename, today, content);
    });

    it('should correctly initialize a new DocumentFile', () => {
        expect(document.id).toEqual(0);
        expect(document.externalUrl).toEqual('external url');
        expect(document.contentHash).toEqual('contentHash');
        expect(document.filename).toEqual(filename);
        expect(document.date).toEqual(today);
        expect(document.transactionLines).toBeUndefined();
        expect(document.quantity).toBeUndefined();
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
