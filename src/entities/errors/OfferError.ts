export class OfferNotFoundError extends Error {
    constructor() {
        super(`Offer not found.`);
    }
}
