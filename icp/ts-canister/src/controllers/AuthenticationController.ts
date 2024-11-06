import {RoleProof} from "../models/types";
import {IDL, update} from "azle";
import {IDLRoleProof} from "../models/idls";
import AuthenticationService from "../services/AuthenticationService";

class AuthenticationController {
    @update([IDLRoleProof], IDL.Bool)
    async authenticate(roleProof: RoleProof): Promise<boolean> {
        return AuthenticationService.instance.authenticate(roleProof);
    }
}
export default AuthenticationController;
