export class OrderNotFoundError extends Error {
    constructor() {
        super(`Order not found.`);
    }
}
export class OrderAlreadyConfirmedError extends Error {
    constructor() {
        super(`Order already confirmed.`);
    }
}
export class OrderAlreadySignedError extends Error {
    constructor() {
        super(`Order already signed.`);
    }
}
export class OrderWithNoChangesError extends Error {
    constructor() {
        super(`Order with no changes.`);
    }
}
