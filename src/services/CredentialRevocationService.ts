import { CredentialRevocationDriver } from '../drivers/CredentialRevocationDriver';
import { RevocationStatus } from '../types/RevocationStatus';

export class CredentialRevocationService {
    private _driver: CredentialRevocationDriver;

    constructor(driver: CredentialRevocationDriver) {
        this._driver = driver;
    }

    async revoke(jwt: string): Promise<void> {
        return this._driver.revoke(jwt);
    }

    async revoked(jwt: string): Promise<RevocationStatus> {
        return this._driver.revoked(jwt);
    }
}
