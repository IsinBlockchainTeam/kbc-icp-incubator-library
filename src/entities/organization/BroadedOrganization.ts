import { OrganizationRole, OrganizationVisibilityLevel } from '@isinblockchainteam/azle-types';
import { Organization } from './Organization';

export { OrganizationRole };

export class BroadedOrganization extends Organization {
    private _industrialSector: string;

    private _address: string;

    private _city: string;

    private _postalCode: string;

    private _region: string;

    private _countryCode: string;

    private _role: OrganizationRole;

    private _telephone: string;

    private _email: string;

    private _image: string;

    constructor(
        ethAddress: string,
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRole,
        telephone: string,
        email: string,
        image: string
    ) {
        super(ethAddress, OrganizationVisibilityLevel.BROAD, legalName);

        this._industrialSector = industrialSector;
        this._address = address;
        this._city = city;
        this._postalCode = postalCode;
        this._region = region;
        this._countryCode = countryCode;
        this._role = role;
        this._telephone = telephone;
        this._email = email;
        this._image = image;
    }

    get industrialSector(): string {
        return this._industrialSector;
    }

    set industrialSector(industrialSector: string) {
        this._industrialSector = industrialSector;
    }

    get address(): string {
        return this._address;
    }

    set address(address: string) {
        this._address = address;
    }

    get city(): string {
        return this._city;
    }

    set city(city: string) {
        this._city = city;
    }

    get postalCode(): string {
        return this._postalCode;
    }

    set postalCode(postalCode: string) {
        this._postalCode = postalCode;
    }

    get region(): string {
        return this._region;
    }

    set region(region: string) {
        this._region = region;
    }

    get countryCode(): string {
        return this._countryCode;
    }

    set countryCode(countryCode: string) {
        this._countryCode = countryCode;
    }

    get role(): OrganizationRole {
        return this._role;
    }

    set role(role: OrganizationRole) {
        this._role = role;
    }

    get telephone(): string {
        return this._telephone;
    }

    set telephone(telephone: string) {
        this._telephone = telephone;
    }

    get email(): string {
        return this._email;
    }

    set email(email: string) {
        this._email = email;
    }

    get image(): string {
        return this._image;
    }

    set image(image: string) {
        this._image = image;
    }
}
