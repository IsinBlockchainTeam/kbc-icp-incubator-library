export type CredentialStatus = ValidStatus | RevokedStatus;

export type ValidStatus = {
    revoked: false;
};

export type RevokedStatus = {
    revoked: true;
    blockNumber: number;
};
