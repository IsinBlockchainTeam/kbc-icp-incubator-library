import { StableBTreeMap } from 'azle';
import AssessmentStandardService from '../AssessmentStandardService';
import { StableMemoryId } from '../../utils/stableMemory';

jest.mock('azle');

describe('AssessmentStandardService', () => {
    let assessmentStandardService: AssessmentStandardService;

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
        assessmentStandardService = AssessmentStandardService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        assessmentStandardService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM));
    });

    it('add a value', () => {
        assessmentStandardService.addValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM), ['value']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => assessmentStandardService.addValue('value')).toThrow(new Error('Enumeration value already exists'));
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        assessmentStandardService.removeValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM), []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => assessmentStandardService.removeValue('value')).toThrow(new Error('Enumeration value does not exist'));
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_STANDARD_ENUM));
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(assessmentStandardService.hasValue('value')).toBeTruthy();
        expect(assessmentStandardService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
    });
});
