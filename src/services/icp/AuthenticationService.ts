import {RoleProof} from "@kbc-lib/azle-types";
import {AuthenticationDriver} from "../../drivers/icp/AuthenticationDriver";

export class AuthenticationService {
    private readonly _authenticationDriver: AuthenticationDriver;

    constructor(authenticationDriver: AuthenticationDriver) {
        this._authenticationDriver = authenticationDriver;
    }

    async login(roleProof: RoleProof): Promise<boolean> {
        return this._authenticationDriver.login(roleProof);
    }

    async refresh(): Promise<boolean> {
        return this._authenticationDriver.refresh();
    }

    async logout(): Promise<boolean> {
        return this._authenticationDriver.logout();
    }
}
