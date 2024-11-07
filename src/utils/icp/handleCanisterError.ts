import {ErrorType} from "@kbc-lib/azle-types";
import {NotAuthenticatedError, NotAuthorizedError, NotValidCredentialError} from "../../entities/icp/errors";

export const handleCanisterError = (error: unknown) => {
    const stringError = String(error);
    if(stringError.includes(ErrorType.NOT_AUTHENTICATED)) {
        throw new NotAuthenticatedError();
    }
    if(stringError.includes(ErrorType.NOT_AUTHORIZED)) {
        throw new NotAuthorizedError();
    }
    if(stringError.includes(ErrorType.NOT_VALID_CREDENTIAL)) {
        throw new NotValidCredentialError();
    }
    throw error;
}
