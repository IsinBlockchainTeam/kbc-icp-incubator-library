export abstract class Certificate {
    private _id: number;

    private _issuer: string;

    private _assessmentStandard: string;

    private _documentId: number;

    private _issueDate: Date;

    protected constructor(id: number, issuer: string, assessmentStandard: string, documentId: number, issueDate: Date) {
        this._id = id;
        this._issuer = issuer;
        this._assessmentStandard = assessmentStandard;
        this._documentId = documentId;
        this._issueDate = issueDate;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get issuer(): string {
        return this._issuer;
    }

    set issuer(value: string) {
        this._issuer = value;
    }

    get assessmentStandard(): string {
        return this._assessmentStandard;
    }

    set assessmentStandard(value: string) {
        this._assessmentStandard = value;
    }

    get documentId(): number {
        return this._documentId;
    }

    set documentId(value: number) {
        this._documentId = value;
    }

    get issueDate(): Date {
        return this._issueDate;
    }

    set issueDate(value: Date) {
        this._issueDate = value;
    }
}
