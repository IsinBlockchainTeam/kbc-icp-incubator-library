import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { ProcessTypeDriver } from '../ProcessTypeDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('ProcessTypeDriver', () => {
    let processTypeDriver: ProcessTypeDriver;
    const mockedActor = {
        getAllProcessTypes: jest.fn(),
        addProcessType: jest.fn(),
        removeProcessType: jest.fn(),
        hasProcessType: jest.fn()
    };
    const processType = 'processType';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllProcessTypes: mockedActor.getAllProcessTypes,
            addProcessType: mockedActor.addProcessType,
            removeProcessType: mockedActor.removeProcessType,
            hasProcessType: mockedActor.hasProcessType
        });
        const icpIdentity = {} as Identity;
        processTypeDriver = new ProcessTypeDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllProcessTypes.mockReturnValue([processType]);
        await expect(processTypeDriver.getAllValues()).resolves.toEqual([processType]);
        expect(mockedActor.getAllProcessTypes).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newProcessType = 'newProcessTypeDriver';
        mockedActor.addProcessType.mockReturnValue(newProcessType);
        await expect(
            processTypeDriver.addValue(newProcessType, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(newProcessType);
        expect(mockedActor.addProcessType).toHaveBeenCalled();
        expect(mockedActor.addProcessType).toHaveBeenCalledWith(
            newProcessType,
            IndustrialSectorEnum.COFFEE
        );
    });

    it('should remove a value', async () => {
        const toRemove = 'processType';
        mockedActor.removeProcessType.mockReturnValue(toRemove);
        await expect(
            processTypeDriver.removeValue(toRemove, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(toRemove);
        expect(mockedActor.removeProcessType).toHaveBeenCalled();
        expect(mockedActor.removeProcessType).toHaveBeenCalledWith(
            toRemove,
            IndustrialSectorEnum.COFFEE
        );
    });

    it('should check if a value already exists', async () => {
        const value = 'processType';
        mockedActor.hasProcessType.mockReturnValue(true);
        await expect(processTypeDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasProcessType).toHaveBeenCalled();
        expect(mockedActor.hasProcessType).toHaveBeenCalledWith(value);
    });
});
