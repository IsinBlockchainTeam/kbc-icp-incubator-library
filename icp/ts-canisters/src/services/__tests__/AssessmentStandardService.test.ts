import { StableBTreeMap } from 'azle';
import AssessmentReferenceStandardService from '../AssessmentReferenceStandardService';
import { AssessmentReferenceStandard, ErrorType, IndustrialSectorEnum } from '../../models/types';
import AuthenticationService from '../AuthenticationService';
import SustainabilityCriteriaService from '../SustainabilityCriteriaService';

jest.mock('azle');
jest.mock('../AuthenticationService', () => ({
    instance: {
        getLoggedOrganization: jest.fn()
    }
}));
jest.mock('../SustainabilityCriteriaService', () => ({
    instance: {
        hasValue: jest.fn()
    }
}));

describe('AssessmentReferenceStandardService', () => {
    let assessmentStandardService: AssessmentReferenceStandardService;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
    const sustainabilityCriteriaServiceInstanceMock = SustainabilityCriteriaService.instance as jest.Mocked<SustainabilityCriteriaService>;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert,
            remove: mockedFn.remove
        });
        assessmentStandardService = AssessmentReferenceStandardService.instance;

        authenticationServiceInstanceMock.getLoggedOrganization = jest.fn().mockReturnValue({ industrialSector: IndustrialSectorEnum.COFFEE });
        sustainabilityCriteriaServiceInstanceMock.hasValue = jest.fn().mockReturnValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        assessmentStandardService.getAll();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, IndustrialSectorEnum.DEFAULT);
        expect(mockedFn.get).toHaveBeenNthCalledWith(2, IndustrialSectorEnum.COFFEE);
    });

    it('retrieves a value by id', () => {
        mockedFn.get.mockReturnValueOnce({ id: 1 });
        assessmentStandardService.getById(BigInt(1));
        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, BigInt(1));
    });

    it('retrieves a value by id - error (Assessment reference standard not found)', () => {
        expect(() => assessmentStandardService.getById(BigInt(1))).toThrow(new Error(`(${ErrorType.ASSESSMENT_REFERENCE_STANDARD_NOT_FOUND}) Assessment reference standard with id 1 not found.`));
        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, BigInt(1));
    });

    it('add a new value', () => {
        mockedFn.values.mockReturnValue([]);
        assessmentStandardService.add('standard1', 'criteria1', 'logo1', 'site1', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.values).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalledTimes(2);
        expect(mockedFn.insert).toHaveBeenNthCalledWith(1, 1n, {
            id: 1n,
            name: 'standard1',
            sustainabilityCriteria: 'criteria1',
            logoUrl: 'logo1',
            siteUrl: 'site1'
        });
        expect(mockedFn.insert).toHaveBeenNthCalledWith(2, IndustrialSectorEnum.COFFEE, [1n]);
    });

    it('add a value reference to an industrial sector (there is already a standard with the same name for another industrial sector)', () => {
        mockedFn.get.mockReturnValueOnce([2n]);
        mockedFn.values.mockReturnValue([{ id: 1n, name: 'standard1' }]);
        assessmentStandardService.add('standard1', 'criteria1', 'logo1', 'site1', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.values).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, [2n, 1n]);
    });

    it('add a value - error (Sustainability Criteria not found)', () => {
        sustainabilityCriteriaServiceInstanceMock.hasValue = jest.fn().mockReturnValue(false);
        expect(() => assessmentStandardService.add('standard1', 'criteria', 'logoUrl', 'siteUrl', IndustrialSectorEnum.COFFEE)).toThrow(
            new Error(`(${ErrorType.ENUMERATION_NOT_FOUND}) Sustainability Criteria value does not exist.`)
        );
    });

    it('add a value - error (Invalid industrial sector)', () => {
        expect(() => assessmentStandardService.add('standard1', 'criteria', 'logoUrl', 'siteUrl', 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
    });

    it('update a value', () => {
        assessmentStandardService.update(2n, 'standard1', 'criteria1', 'logo1', 'site1');
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(2n, {
            id: 2n,
            name: 'standard1',
            sustainabilityCriteria: 'criteria1',
            logoUrl: 'logo1',
            siteUrl: 'site1'
        });
    });

    it('remove a value reference only for its industrial sector', () => {
        jest.spyOn(assessmentStandardService, 'getAll').mockReturnValueOnce([{ id: 1n } as AssessmentReferenceStandard]);
        mockedFn.values.mockReturnValueOnce([[1n]]);

        assessmentStandardService.remove(1n, IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, []);
        expect(mockedFn.remove).not.toHaveBeenCalled();
    });

    it('remove entirely a value because there are no more references associated with industrial sector', () => {
        jest.spyOn(assessmentStandardService, 'getAll').mockReturnValueOnce([{ id: 1n } as AssessmentReferenceStandard]);

        assessmentStandardService.remove(1n, IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, []);
        expect(mockedFn.remove).toHaveBeenCalled();
        expect(mockedFn.remove).toHaveBeenCalledWith(1n);
    });

    it('remove a value - error (Assessment reference standard value does not exist)', () => {
        expect(() => assessmentStandardService.remove(2n, IndustrialSectorEnum.COFFEE)).toThrow(
            new Error(`(${ErrorType.ASSESSMENT_REFERENCE_STANDARD_NOT_FOUND}) Assessment reference standard with id 2 not found.`)
        );
        expect(mockedFn.get).toHaveBeenCalled();
    });

    it('remove a value - error (Invalid industrial sector)', () => {
        expect(() => assessmentStandardService.remove(2n, 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
        expect(mockedFn.get).not.toHaveBeenCalled();
    });
});
