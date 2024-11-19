export class ProductCategoryNotFoundError extends Error {
    constructor() {
        super(`Product category not found.`);
    }
}
