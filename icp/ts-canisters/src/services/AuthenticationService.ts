import { StableBTreeMap } from 'azle';
import { ic, Principal } from 'azle/experimental';
import { RoleProof, ROLES } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import DelegationService from './DelegationService';
import { NotAuthenticatedError, NotValidCredentialError } from '../models/errors';
import { Misc } from '../constants/misc';
import { Organization } from '../models/types/src/Organization';
import OrganizationService from './OrganizationService';

type UserAuthentication = {
    roleProof: RoleProof;
    expiration: number;
};
class AuthenticationService {
    private static _instance: AuthenticationService;

    private _authentications = StableBTreeMap<string, UserAuthentication>(StableMemoryId.AUTHENTICATION);

    private _loginDuration: number = Number(Misc.LOGIN_DURATION);

    private _incrementalRoles = [ROLES.VIEWER, ROLES.EDITOR, ROLES.SIGNER];

    static get instance() {
        if (!AuthenticationService._instance) {
            AuthenticationService._instance = new AuthenticationService();
        }
        return AuthenticationService._instance;
    }

    async authenticate(roleProof: RoleProof): Promise<void> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const hasValidRole = await DelegationService.instance.hasValidRoleProof(roleProof, ic.caller());
        if (!hasValidRole) throw new NotValidCredentialError();
        const expiration = unixTime + this._loginDuration;
        this._authentications.insert(ic.caller().toText(), {
            roleProof,
            expiration
        });
        console.log('authenticate - roleProof: ', roleProof);
    }

    // TODO: periodically remove expired authentications
    async logout(): Promise<void> {
        if (!this._authentications.containsKey(ic.caller().toText())) {
            throw new NotAuthenticatedError();
        }
        this._authentications.remove(ic.caller().toText());
    }

    getLoggedOrganization(): Organization {
        return OrganizationService.instance.getRawOrganization(this.getDelegatorAddress());
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
        if (!authentication || authentication.expiration <= unixTime) return false;
        const actualRole = authentication.roleProof.role;
        return this._incrementalRoles.indexOf(actualRole) >= this._incrementalRoles.indexOf(minimumRole);
    }
}
export default AuthenticationService;
