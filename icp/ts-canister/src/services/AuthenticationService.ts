import { RoleProof, ROLES } from "../models/types";
import { StableBTreeMap } from "azle";
import { StableMemoryId } from "../utils/stableMemory";
import { ic, Principal } from "azle/experimental";
import DelegationService from "./DelegationService";
import { getLoginDuration } from "../utils/env";
import {
    NotAuthenticatedError,
    NotValidCredentialError,
} from "../models/errors";

type UserAuthentication = {
    roleProof: RoleProof;
    expiration: number;
};
class AuthenticationService {
    private static _instance: AuthenticationService;
    private _authentications = StableBTreeMap<string, UserAuthentication>(
        StableMemoryId.AUTHENTICATION,
    );
    private _loginDuration: number = Number(getLoginDuration());
    private _incrementalRoles = [ROLES.VIEWER, ROLES.EDITOR, ROLES.SIGNER];

    private constructor() {}
    static get instance() {
        if (!AuthenticationService._instance) {
            AuthenticationService._instance = new AuthenticationService();
        }
        return AuthenticationService._instance;
    }

    async authenticate(roleProof: RoleProof): Promise<void> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const hasValidRole = await DelegationService.instance.hasValidRoleProof(
            roleProof,
            ic.caller(),
        );
        if (!hasValidRole) throw new NotValidCredentialError();
        const expiration = unixTime + this._loginDuration;
        this._authentications.insert(ic.caller().toText(), {
            roleProof,
            expiration,
        });
    }

    // TODO: periodically remove expired authentications
    async logout(): Promise<void> {
        if (!this._authentications.containsKey(ic.caller().toText())) {
            throw new NotAuthenticatedError();
        }
        this._authentications.remove(ic.caller().toText());
    }

    getDelegatorAddress(caller: Principal = ic.caller()): string {
        const authentication = this._authentications.get(caller.toText());
        if (!authentication) throw new NotAuthenticatedError();
        return authentication.roleProof.membershipProof.delegatorAddress;
    }

    getRole(caller: Principal = ic.caller()): string {
        const authentication = this._authentications.get(caller.toText());
        if (!authentication) throw new NotAuthenticatedError();
        return authentication.roleProof.role;
    }

    isAuthenticated(caller: Principal): boolean {
        const authentication = this._authentications.get(caller.toText());
        if (!authentication) return false;
        const unixTime = Number(ic.time().toString().substring(0, 13));
        return authentication.expiration > unixTime;
    }

    isAtLeast(caller: Principal, minimumRole: string): boolean {
        const authentication = this._authentications.get(caller.toText());
        const unixTime = Number(ic.time().toString().substring(0, 13));
        if (!authentication || authentication.expiration <= unixTime)
            return false;
        const actualRole = authentication.roleProof.role;
        return (
            this._incrementalRoles.indexOf(actualRole) >=
            this._incrementalRoles.indexOf(minimumRole)
        );
    }
}
export default AuthenticationService;
