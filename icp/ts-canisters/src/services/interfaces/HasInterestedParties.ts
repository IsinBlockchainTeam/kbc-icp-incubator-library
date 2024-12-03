export interface HasInterestedParties {
    getInterestedParties(entityId: bigint): string[];
    getSupplier(entityId: bigint): string;
    getCommissioner(entityId: bigint): string;
}
