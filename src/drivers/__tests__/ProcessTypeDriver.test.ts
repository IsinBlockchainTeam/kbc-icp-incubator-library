import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
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
        const newProcessTypeDriver = 'newProcessTypeDriver';
        mockedActor.addProcessType.mockReturnValue(newProcessTypeDriver);
        await expect(processTypeDriver.addValue(newProcessTypeDriver)).resolves.toEqual(
            newProcessTypeDriver
        );
        expect(mockedActor.addProcessType).toHaveBeenCalled();
        expect(mockedActor.addProcessType).toHaveBeenCalledWith(newProcessTypeDriver);
    });

    it('should remove a value', async () => {
        const toRemove = 'processType';
        mockedActor.removeProcessType.mockReturnValue(toRemove);
        await expect(processTypeDriver.removeValue(toRemove)).resolves.toEqual(toRemove);
        expect(mockedActor.removeProcessType).toHaveBeenCalled();
        expect(mockedActor.removeProcessType).toHaveBeenCalledWith(toRemove);
    });

    it('should check if a value already exists', async () => {
        const value = 'processType';
        mockedActor.hasProcessType.mockReturnValue(true);
        await expect(processTypeDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasProcessType).toHaveBeenCalled();
        expect(mockedActor.hasProcessType).toHaveBeenCalledWith(value);
    });
});
