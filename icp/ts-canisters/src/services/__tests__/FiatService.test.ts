import { StableBTreeMap } from 'azle';
import FiatService from '../FiatService';
import { ErrorType, IndustrialSectorEnum } from '../../models/types';
import AuthenticationService from '../AuthenticationService';

jest.mock('azle');
jest.mock('../AuthenticationService', () => ({
    instance: {
        getLoggedOrganization: jest.fn()
    }
}));

describe('FiatService', () => {
    let fiatService: FiatService;
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
        fiatService = FiatService.instance;

        authenticationServiceInstanceMock.getLoggedOrganization = jest.fn().mockReturnValue({ industrialSector: IndustrialSectorEnum.COFFEE });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('retrieves all values', () => {
        fiatService.getAllValues();
        expect(mockedFn.get).toHaveBeenCalledTimes(2);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, IndustrialSectorEnum.DEFAULT);
        expect(mockedFn.get).toHaveBeenNthCalledWith(2, IndustrialSectorEnum.COFFEE);
    });

    it('add a value', () => {
        mockedFn.get.mockReturnValue(['value1']);
        jest.spyOn(fiatService, 'hasValue').mockReturnValueOnce(false);

        fiatService.addValue('value2', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, ['value1', 'value2']);
    });

    it('add a value - error (Enumeration value already exists)', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(() => fiatService.addValue('value', IndustrialSectorEnum.COFFEE)).toThrow(new Error(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) Fiat value already exists.`));
    });

    it('add a value - error (Invalid industrial sector)', () => {
        expect(() => fiatService.addValue('value', 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
    });

    it('remove a value', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        jest.spyOn(fiatService, 'hasValue').mockReturnValueOnce(true);

        fiatService.removeValue('value', IndustrialSectorEnum.COFFEE);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE, []);
    });

    it('remove a value - error (Enumeration value does not exist)', () => {
        expect(() => fiatService.removeValue('value', IndustrialSectorEnum.COFFEE)).toThrow(new Error(`(${ErrorType.ENUMERATION_NOT_FOUND}) Fiat value does not exist.`));
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.get).toHaveBeenCalledWith(IndustrialSectorEnum.COFFEE);
    });

    it('remove a value - error (Invalid industrial sector)', () => {
        expect(() => fiatService.removeValue('value', 'sector')).toThrow(new Error(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`));
        expect(mockedFn.get).not.toHaveBeenCalled();
    });

    it('checks if a value exists', () => {
        mockedFn.get.mockReturnValueOnce(['value']);
        expect(fiatService.hasValue('value')).toBeTruthy();
        expect(fiatService.hasValue('anotherValue')).toBeFalsy();
        expect(mockedFn.get).toHaveBeenCalledTimes(4);
    });
});
