const OnlyRole = (originalMethod: any, _context: any) => {
    return async function (this: any, ...args: any[]) {
        return originalMethod.call(this, ...args);
    };
};
export const OnlyViewer = jest.fn((originalMethod: any, _context: any) => OnlyRole(originalMethod, _context));
export const OnlyEditor = jest.fn((originalMethod: any, _context: any) => OnlyRole(originalMethod, _context));
export const OnlySigner = jest.fn((originalMethod: any, _context: any) => OnlyRole(originalMethod, _context));
