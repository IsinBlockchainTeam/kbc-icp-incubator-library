import {RoleProof} from "../models/types";
import {update} from "azle";
import {IDLRoleProof} from "../models/idls";
import AuthenticationService from "../services/AuthenticationService";

class AuthenticationController {
    @update([IDLRoleProof])
    async authenticate(roleProof: RoleProof): Promise<void> {
        return AuthenticationService.instance.authenticate(roleProof);
    }

    @update([])
    async logout(): Promise<void> {
        return AuthenticationService.instance.logout();
    }
}
export default AuthenticationController;
