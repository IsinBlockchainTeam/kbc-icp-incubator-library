import { StableBTreeMap } from 'azle';
import AssessmentReferenceStandardService from '../AssessmentReferenceStandardService';
import { StableMemoryId } from '../../utils/stableMemory';
import { ErrorType } from '../../models/types';

jest.mock('azle');

describe('AssessmentStandardService', () => {
    let assessmentStandardService: AssessmentReferenceStandardService;

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
        assessmentStandardService = AssessmentReferenceStandardService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        assessmentStandardService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD));
    });

    it('add a value', () => {
        assessmentStandardService.addValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD), ['value']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => assessmentStandardService.addValue('value')).toThrow(
            new Error(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) Enumeration value already exists.`)
        );
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        assessmentStandardService.removeValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD), []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => assessmentStandardService.removeValue('value')).toThrow(
            new Error(`(${ErrorType.ENUMERATION_NOT_FOUND}) Enumeration value does not exist.`)
        );
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD));
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(assessmentStandardService.hasValue('value')).toBeTruthy();
        expect(assessmentStandardService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
    });
});
