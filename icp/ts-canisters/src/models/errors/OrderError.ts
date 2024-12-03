import {ErrorType} from "../types";

export class OrderNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.ORDER_NOT_FOUND}) Order not found.`);
        this.name = 'OrderNotFoundError';
    }
}
export class OrderAlreadyConfirmedError extends Error {
    constructor() {
        super(`(${ErrorType.ORDER_ALREADY_CONFIRMED}) Order already confirmed.`);
        this.name = 'OrderAlreadyConfirmedError';
    }
}
export class OrderAlreadySignedError extends Error {
    constructor() {
        super(`(${ErrorType.ORDER_ALREADY_SIGNED}) Order already signed.`);
        this.name = 'OrderAlreadySignedError';
    }
}
export class OrderWithNoChangesError extends Error {
    constructor() {
        super(`(${ErrorType.ORDER_NO_CHANGES}) Order with no changes.`);
        this.name = 'OrderWithNoChangesError';
    }
}
