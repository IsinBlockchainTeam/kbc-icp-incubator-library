import { StableBTreeMap } from 'azle';
import UnitService from '../UnitService';
import { StableMemoryId } from '../../utils/stableMemory';
import { ErrorType } from '../../models/types';

jest.mock('azle');

describe('UnitService', () => {
    let processTypeService: UnitService;

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
        processTypeService = UnitService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        processTypeService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM));
    });

    it('add a value', () => {
        processTypeService.addValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM), ['value']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => processTypeService.addValue('value')).toThrow(
            new Error(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) Enumeration value already exists.`)
        );
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        processTypeService.removeValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM), []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => processTypeService.removeValue('value')).toThrow(
            new Error(`(${ErrorType.ENUMERATION_NOT_FOUND}) Enumeration value does not exist.`)
        );
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.UNIT_ENUM));
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(processTypeService.hasValue('value')).toBeTruthy();
        expect(processTypeService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
    });
});
