const AtLeastRole = (originalMethod: any, _context: any) => async function (this: any, ...args: any[]) {
        return originalMethod.call(this, ...args);
    };
export const AtLeastViewer = jest.fn((originalMethod: any, _context: any) => AtLeastRole(originalMethod, _context));
export const AtLeastEditor = jest.fn((originalMethod: any, _context: any) => AtLeastRole(originalMethod, _context));
export const AtLeastSigner = jest.fn((originalMethod: any, _context: any) => AtLeastRole(originalMethod, _context));
export const OnlyController = jest.fn((originalMethod: any, _context: any) => AtLeastRole(originalMethod, _context));
