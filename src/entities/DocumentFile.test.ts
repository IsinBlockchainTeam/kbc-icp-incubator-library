import { DocumentFile } from './DocumentFile';

describe('DocumentFile', () => {
    let documentFile: DocumentFile;
    const filename = 'filename1.pdf';
    const content = new Blob(['b', 'l', 'o', 'b']);

    beforeAll(() => {
        documentFile = new DocumentFile(filename, content);
    });

    it('should correctly initialize a new DocumentFile', () => {
        expect(documentFile.filename).toEqual(filename);
        expect(documentFile.content.size).toEqual(content.size);
        expect(documentFile.content.type).toEqual(content.type);
    });
});
