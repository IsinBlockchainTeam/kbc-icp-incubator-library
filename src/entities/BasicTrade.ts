import { BasicTradeInfo } from './BasicTradeInfo';

export class BasicTrade extends BasicTradeInfo {
    private readonly _issueDate?: Date;

    constructor(basicTradeInfo: BasicTradeInfo, issueDate: Date) {
        super(basicTradeInfo.id, basicTradeInfo.supplier, basicTradeInfo.customer,
            basicTradeInfo.externalUrl, basicTradeInfo.lineIds, basicTradeInfo.name);
        this._issueDate = issueDate;
    }

    get issueDate(): Date | undefined {
        return this._issueDate;
    }
}
