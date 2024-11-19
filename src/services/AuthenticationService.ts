import { RoleProof } from '../types/RoleProof';
import { AuthenticationDriver } from '../drivers/AuthenticationDriver';

export class AuthenticationService {
    private readonly _authenticationDriver: AuthenticationDriver;

    constructor(authenticationDriver: AuthenticationDriver) {
        this._authenticationDriver = authenticationDriver;
    }

    async authenticate(roleProof: RoleProof): Promise<void> {
        return this._authenticationDriver.authenticate(roleProof);
    }

    async logout(): Promise<void> {
        return this._authenticationDriver.logout();
    }
}
