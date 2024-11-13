import {ErrorType} from "../types";

export class ProductCategoryNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.PRODUCT_CATEGORY_NOT_FOUND}) Product category not found.`);
        this.name = 'ProductCategoryNotFoundError';
    }
}
