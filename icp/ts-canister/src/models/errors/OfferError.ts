import {ErrorType} from "../types";

export class OfferNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.OFFER_NOT_FOUND}) Offer not found.`);
        this.name = 'OfferNotFoundError';
    }
}
