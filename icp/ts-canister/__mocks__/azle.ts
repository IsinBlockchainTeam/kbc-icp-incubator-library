const baseDecorator = (originalMethod: any, _context: any) => {
    return async function (this: any, ...args: any[]) {
        return originalMethod.call(this, ...args);
    };
};
export const query = jest.fn(() => baseDecorator);
export const update = jest.fn(() => baseDecorator);

export const IDL = {
    Record: jest.fn(),
    Nat: jest.fn(),
    Text: jest.fn(),
    Vec: jest.fn(),
    Variant: jest.fn(),
    Opt: jest.fn(),
    Tuple: jest.fn(),
};

export const StableBTreeMap = jest.fn();
