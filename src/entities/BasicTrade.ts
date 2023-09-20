import { Trade } from './Trade';

export class BasicTrade extends Trade {
    private readonly _issueDate?: Date;

    constructor(id: number, name: string, supplier: string, customer: string, externalUrl: string, lineIds: number[], issueDate?: Date) {
        super(id, name, supplier, customer, externalUrl, lineIds);
        this._issueDate = issueDate;
    }

    get issueDate(): Date | undefined {
        return this._issueDate;
    }
}
