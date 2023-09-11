export class OrderMetadata {
    private readonly _issueDate: Date;

    constructor(issueDate: Date) {
        this._issueDate = issueDate;
    }

    get issueDate(): Date {
        return this._issueDate;
    }
}
