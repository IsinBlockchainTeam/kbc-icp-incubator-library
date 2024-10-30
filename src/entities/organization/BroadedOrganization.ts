import { Organization } from './Organization';

export class BroadedOrganization extends Organization {
    private _description: string;

    constructor(id: number, name: string, description: string) {
        super(id, name);

        this._description = description;
    }

    get description(): string {
        return this._description;
    }

    set description(description: string) {
        this._description = description;
    }
}
