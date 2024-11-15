import { StableBTreeMap } from 'azle';
import FiatService from '../FiatService';
import { StableMemoryId } from '../../utils/stableMemory';

jest.mock('azle');

describe('FiatService', () => {
    let fiatService: FiatService;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert
        });
        fiatService = FiatService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        fiatService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM));
    });

    it('add a value', () => {
        fiatService.addValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM), ['value']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => fiatService.addValue('value')).toThrow(new Error('Enumeration value already exists'));
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        fiatService.removeValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM), []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => fiatService.removeValue('value')).toThrow(new Error('Enumeration value does not exist'));
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.FIAT_ENUM));
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(fiatService.hasValue('value')).toBeTruthy();
        expect(fiatService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
    });
});
