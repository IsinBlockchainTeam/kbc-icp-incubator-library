import { StableBTreeMap } from 'azle';
import AssessmentAssuranceLevelService from '../AssessmentAssuranceLevelService';
import { ErrorType, IndustrialSectorEnum } from '../../models/types';
import AuthenticationService from '../AuthenticationService';

jest.mock('azle');
jest.mock('../AuthenticationService', () => ({
    instance: {
        getLoggedOrganization: jest.fn()
    }
}));

describe('AssessmentAssuranceLevelService', () => {
    let assessmentAssuranceLevelService: AssessmentAssuranceLevelService;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;

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

        authenticationServiceInstanceMock.getLoggedOrganization = jest.fn().mockReturnValue({ industrialSector: IndustrialSectorEnum.COFFEE });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        assessmentAssuranceLevelService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, IndustrialSectorEnum.DEFAULT);
        expect(mockedFn.get).toHaveBeenNthCalledWith(2, IndustrialSectorEnum.COFFEE);
    });

    it('add a value', () => {
        mockedFn.get.mockReturnValue(['value1']);
        jest.spyOn(assessmentAssuranceLevelService, 'hasValue').mockReturnValueOnce(false);

        assessmentAssuranceLevelService.addValue('value2', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, ['value1', 'value2']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => assessmentAssuranceLevelService.addValue('value', IndustrialSectorEnum.COFFEE)).toThrow(
            new Error(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) Assessment Assurance Level value already exists.`)
        );
    });

    it('add a value - error (Invalid industrial sector)', () => {
        expect(() => assessmentAssuranceLevelService.addValue('value', 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        jest.spyOn(assessmentAssuranceLevelService, 'hasValue').mockReturnValueOnce(true);

        assessmentAssuranceLevelService.removeValue('value', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => assessmentAssuranceLevelService.removeValue('value', IndustrialSectorEnum.COFFEE)).toThrow(
            new Error(`(${ErrorType.ENUMERATION_NOT_FOUND}) Assessment Assurance Level value does not exist.`)
        );
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
    });

    it('remove a value - error (Invalid industrial sector)', () => {
        expect(() => assessmentAssuranceLevelService.removeValue('value', 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
        expect(mockedFn.get).not.toHaveBeenCalled();
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(assessmentAssuranceLevelService.hasValue('value')).toBeTruthy();
        expect(assessmentAssuranceLevelService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(4);
    });
});
