import { OrganizationVisibilityLevel } from '@isinblockchainteam/azle-types';

export abstract class Organization {
    private _ethAddress: string;

    private _visibilityLevel: OrganizationVisibilityLevel;

    private _legalName: string;

    protected constructor(
        ethAddress: string,
        visibilityLevel: OrganizationVisibilityLevel,
        legalName: string
    ) {
        this._ethAddress = ethAddress;
        this._visibilityLevel = visibilityLevel;
        this._legalName = legalName;
    }

    get ethAddress(): string {
        return this._ethAddress;
    }

    set ethAddress(ethAddress: string) {
        this._ethAddress = ethAddress;
    }

    get visibilityLevel(): OrganizationVisibilityLevel {
        return this._visibilityLevel;
    }

    set visibilityLevel(visibilityLevel: OrganizationVisibilityLevel) {
        this._visibilityLevel = visibilityLevel;
    }

    get legalName(): string {
        return this._legalName;
    }

    set legalName(name: string) {
        this._legalName = name;
    }
}
