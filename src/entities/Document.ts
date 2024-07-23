import { DocumentInfo, DocumentType } from './DocumentInfo';

export type TransactionLine = { id: number; quantity?: number };

export enum DocumentStatus {
    NOT_EVALUATED,
    APPROVED,
    NOT_APPROVED
}

export interface DocumentMetadata {
    fileName: string;
    documentType: DocumentType;
    date: Date;
    transactionLines: TransactionLine[];
    quantity?: number;
}

export class Document extends DocumentInfo {
    private _filename: string;

    private _documentType: DocumentType;

    private _date: Date;

    private _transactionLines?: TransactionLine[];

    private _quantity?: number;

    private _content: Uint8Array;

    constructor(
        documentInfo: DocumentInfo,
        filename: string,
        documentType: DocumentType,
        date: Date,
        content: Uint8Array,
        transactionLines?: TransactionLine[],
        quantity?: number
    ) {
        super(
            documentInfo.id,
            documentInfo.externalUrl,
            documentInfo.contentHash,
            documentInfo.uploadedBy
        );
        this._filename = filename;
        this._documentType = documentType;
        this._date = date;
        this._content = content;
        this._transactionLines = transactionLines;
        this._quantity = quantity;
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

    get documentType(): DocumentType {
        return this._documentType;
    }

    set documentType(value: DocumentType) {
        this._documentType = value;
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
