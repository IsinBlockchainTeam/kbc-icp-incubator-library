import { DocumentInfo } from './DocumentInfo';

export type TransactionLine = {id: number, quantity?: number}
export class Document extends DocumentInfo {
    private _filename: string;

    private _date: Date;

    private _transactionLines?: TransactionLine[];

    private _quantity?: number;

    private _content: Uint8Array;

    constructor(documentInfo: DocumentInfo, filename: string, date: Date, content: Uint8Array, transactionLines?: TransactionLine[]) {
        super(documentInfo.id, documentInfo.externalUrl, documentInfo.contentHash);
        this._filename = filename;
        this._date = date;
        this._content = content;
        this._transactionLines = transactionLines;
    }

    get filename(): string {
        return this._filename;
    }

    set filename(value: string) {
        this._filename = value;
    }

    get content(): Uint8Array {
        return this._content;
    }

    set content(value: Uint8Array) {
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

    get transactionLines(): TransactionLine[] | undefined {
        return this._transactionLines;
    }

    set transactionLines(value: TransactionLine[] | undefined) {
        this._transactionLines = value;
    }
}
