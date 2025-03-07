/*
Path structure is the following (<mainnet/local_replica>):
<http/https>://
    <canister-id>.<localhost:4943/ic0.app>/
    organization/<organization_id>/
    // TODO: add the next line reference change
    // transactions/<order_address>/
    transactions/<transaction_id>/
    files/<file_name>

Examples:
    - http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:4943/organizations/1/transactions/5/files/metadata.json
    - https://osr3e-iqaaa-aaaak-akq7a-cai.ic0.app/organizations/4/transactions/3/files/payment-invoice.pdf
 */

export const URL_SEGMENTS = {
    HTTP: 'http://',
    HTTPS: 'https://',
    LOCAL_REPLICA: 'localhost:4943/',
    MAINNET: 'ic0.app/',
    ORGANIZATION: 'organizations/',
    TRANSACTION: 'transactions/',
    CERTIFICATION: {
        BASE: 'certifications/',
        COMPANY: 'company/',
        SCOPE: 'scope/',
        MATERIAL: 'materials/'
    },
    FILE: 'files/'
};

export const URL_SEGMENT_INDEXES = {
    CANISTER_ID: 2,
    ORGANIZATION_ID: 4,
    TRANSACTION_ID: 6,
    FILE_NAME: 8
};
