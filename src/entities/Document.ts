import { Blob } from 'buffer';
import { DocumentInfo } from './DocumentInfo';

export class Document extends DocumentInfo {
    private _filename: string;

    private _date: Date;

    private _quantity?: number;

    private _content: Blob;

    constructor(documentInfo: DocumentInfo, filename: string, date: Date, content: Blob, quantity?: number) {
        super(documentInfo.id, documentInfo.transactionId, documentInfo.name, documentInfo.documentType, documentInfo.externalUrl, documentInfo.transactionLineIds || []);
        this._filename = filename;
        this._date = date;
        this._content = content;
        this._quantity = quantity;
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

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = value;
    }

    get quantity(): number | undefined {
        return this._quantity;
    }

    set quantity(value: number | undefined) {
        this._quantity = value;
    }
}
