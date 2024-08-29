import { RevocationDriver } from '../drivers/RevocationDriver';
import { RevocationStatus } from '../types/RevocationStatus';

export class RevocationService {
    private _driver: RevocationDriver;

    constructor(driver: RevocationDriver) {
        this._driver = driver;
    }

    async revoke(hash: string): Promise<void> {
        return this._driver.revoke(hash);
    }

    async revoked(issuer: string, hash: string): Promise<RevocationStatus> {
        return this._driver.revoked(issuer, hash);
    }
}
