import { CredentialRevocationDriver } from '../drivers/CredentialRevocationDriver';
import { CredentialStatus } from '../types/CredentialStatus';

export class CredentialRevocationService {
    private _driver: CredentialRevocationDriver;

    constructor(driver: CredentialRevocationDriver) {
        this._driver = driver;
    }

    async revoke(jwt: string): Promise<string> {
        return this._driver.revoke(jwt);
    }

    async revoked(jwt: string): Promise<CredentialStatus> {
        return this._driver.revoked(jwt);
    }
}
