import { StableBTreeMap } from 'azle';
import { ic, Principal } from 'azle/experimental';
import { RoleProof, ROLES } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import DelegationService from './DelegationService';
import { LOGIN_DURATION } from '../constants/misc';

type UserAuthentication = {
    roleProof: RoleProof;
    expiration: number;
};
class AuthenticationService {
    private static _instance: AuthenticationService;

    private _authentications = StableBTreeMap<string, UserAuthentication>(StableMemoryId.AUTHENTICATION);

    private _loginDuration: number = Number(LOGIN_DURATION());

    private _incrementalRoles = [ROLES.VIEWER, ROLES.EDITOR, ROLES.SIGNER];

    private constructor() {}

    static get instance() {
        if (!AuthenticationService._instance) {
            AuthenticationService._instance = new AuthenticationService();
        }
        return AuthenticationService._instance;
    }

    async login(roleProof: RoleProof): Promise<boolean> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const hasValidRole = await DelegationService.instance.hasValidRoleProof(roleProof, ic.caller());
        if (!hasValidRole) return false;
        const expiration = unixTime + this._loginDuration;
        this._authentications.insert(ic.caller().toText(), {
            roleProof,
            expiration
        });
        return true;
    }

    async refresh(): Promise<boolean> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const authentication = this._authentications.get(ic.caller().toText());
        if (!authentication) return false;
        const hasValidRole = await DelegationService.instance.hasValidRoleProof(authentication.roleProof, ic.caller());
        if (!hasValidRole) return false;
        this._authentications.insert(ic.caller().toText(), {
            roleProof: authentication.roleProof,
            expiration: unixTime + this._loginDuration
        });
        return true;
    }

    async logout(): Promise<boolean> {
        if (this._authentications.containsKey(ic.caller().toText())) {
            this._authentications.remove(ic.caller().toText());
            return true;
        }
        return false;
    }

    getDelegatorAddress(caller: Principal = ic.caller()): string {
        const authentication = this._authentications.get(caller.toText());
        if (!authentication) throw new Error('Access denied: user is not authenticated');
        return authentication.roleProof.membershipProof.delegatorAddress;
    }

    getRole(caller: Principal = ic.caller()): string {
        const authentication = this._authentications.get(caller.toText());
        if (!authentication) throw new Error('Access denied: user is not authenticated');
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
        if (!authentication || authentication.expiration <= unixTime) return false;
        const actualRole = authentication.roleProof.role;
        return this._incrementalRoles.indexOf(actualRole) >= this._incrementalRoles.indexOf(minimumRole);
    }
}
export default AuthenticationService;
