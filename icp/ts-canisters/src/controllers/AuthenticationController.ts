import { update } from 'azle';
import { RoleProof } from '../models/types';
import { IDLRoleProof } from '../models/idls';
import AuthenticationService from '../services/AuthenticationService';

class AuthenticationController {
    @update([IDLRoleProof])
    async authenticate(roleProof: RoleProof): Promise<void> {
        return AuthenticationService.instance.authenticate(roleProof);
    }

    @update([])
    async logout(): Promise<void> {
        await AuthenticationService.instance.logout();
    }
}
export default AuthenticationController;
