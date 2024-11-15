import { StableBTreeMap } from 'azle';
import AssessmentAssuranceLevelService from '../AssessmentAssuranceLevelService';
import { StableMemoryId } from '../../utils/stableMemory';

jest.mock('azle');

describe('AssessmentAssuranceLevelService', () => {
    let assessmentAssuranceLevelService: AssessmentAssuranceLevelService;

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
        assessmentAssuranceLevelService = AssessmentAssuranceLevelService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        assessmentAssuranceLevelService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM));
    });

    it('add a value', () => {
        assessmentAssuranceLevelService.addValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM), ['value']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => assessmentAssuranceLevelService.addValue('value')).toThrow(new Error('Enumeration value already exists'));
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        assessmentAssuranceLevelService.removeValue('value');
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM));
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM), []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => assessmentAssuranceLevelService.removeValue('value')).toThrow(new Error('Enumeration value does not exist'));
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(BigInt(StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM));
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(assessmentAssuranceLevelService.hasValue('value')).toBeTruthy();
        expect(assessmentAssuranceLevelService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
    });
});
