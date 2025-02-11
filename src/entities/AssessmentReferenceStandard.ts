export class AssessmentReferenceStandard {
    private _id: number;

    private _name: string;

    private _sustainabilityCriteria: string;

    private _logoUrl: string;

    private _siteUrl: string;

    constructor(
        id: number,
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ) {
        this._id = id;
        this._name = name;
        this._sustainabilityCriteria = sustainabilityCriteria;
        this._logoUrl = logoUrl;
        this._siteUrl = siteUrl;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get sustainabilityCriteria(): string {
        return this._sustainabilityCriteria;
    }

    set sustainabilityCriteria(value: string) {
        this._sustainabilityCriteria = value;
    }

    get logoUrl(): string {
        return this._logoUrl;
    }

    set logoUrl(value: string) {
        this._logoUrl = value;
    }

    get siteUrl(): string {
        return this._siteUrl;
    }

    set siteUrl(value: string) {
        this._siteUrl = value;
    }
}
