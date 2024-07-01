import { Line, Trade } from './Trade';

export interface BasicTradeMetadata {
    issueDate: Date;
}

export class BasicTrade extends Trade {
    private _name: string;

    private _metadata?: BasicTradeMetadata;

    constructor(
        tradeId: number,
        supplier: string,
        customer: string,
        commissioner: string,
        externalUrl: string,
        lines: Line[],
        name: string,
        metadata?: BasicTradeMetadata
    ) {
        super(tradeId, supplier, customer, commissioner, externalUrl, lines);
        this._name = name;
        this._metadata = metadata;
    }

    get name(): string {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }

    get metadata(): BasicTradeMetadata | undefined {
        return this._metadata;
    }

    set metadata(newMetadata: BasicTradeMetadata | undefined) {
        this._metadata = newMetadata;
    }
}
