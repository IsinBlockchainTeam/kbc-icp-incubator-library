import { DocumentInfo } from './DocumentInfo';

export class Document extends DocumentInfo {
    private _filename: string;

    private _content: Blob;

    constructor(documentInfo: DocumentInfo, filename: string, content: Blob) {
        super(documentInfo.id, documentInfo.transactionId, documentInfo.name, documentInfo.documentType, documentInfo.externalUrl);
        this._filename = filename;
        this._content = content;
    }

    get filename(): string {
        return this._filename;
    }

    set filename(value: string) {
        this._filename = value;
    }

    get content(): Blob {
        return this._content;
    }

    set content(value: Blob) {
        this._content = value;
    }
}
