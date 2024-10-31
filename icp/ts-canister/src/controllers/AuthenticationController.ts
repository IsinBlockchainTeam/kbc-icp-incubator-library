import { IDL, update } from 'azle';
import { RoleProof } from '../models/types';
import { IDLRoleProof } from '../models/idls';
import AuthenticationService from '../services/AuthenticationService';

class AuthenticationController {
    @update([IDLRoleProof], IDL.Bool)
    async login(roleProof: RoleProof): Promise<boolean> {
        return AuthenticationService.instance.login(roleProof);
    }

    @update([], IDL.Bool)
    async refresh(): Promise<boolean> {
        return AuthenticationService.instance.refresh();
    }

    @update([], IDL.Bool)
    async logout(): Promise<boolean> {
        return AuthenticationService.instance.logout();
    }
}
export default AuthenticationController;
