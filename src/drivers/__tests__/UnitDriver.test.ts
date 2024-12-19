import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { UnitDriver } from '../UnitDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('UnitDriver', () => {
    let unitDriver: UnitDriver;
    const mockedActor = {
        getAllUnits: jest.fn(),
        addUnit: jest.fn(),
        removeUnit: jest.fn(),
        hasUnit: jest.fn()
    };
    const unit = 'unit';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllUnits: mockedActor.getAllUnits,
            addUnit: mockedActor.addUnit,
            removeUnit: mockedActor.removeUnit,
            hasUnit: mockedActor.hasUnit
        });
        const icpIdentity = {} as Identity;
        unitDriver = new UnitDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllUnits.mockReturnValue([unit]);
        await expect(unitDriver.getAllValues()).resolves.toEqual([unit]);
        expect(mockedActor.getAllUnits).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newUnitDriver = 'newUnitDriver';
        mockedActor.addUnit.mockReturnValue(newUnitDriver);
        await expect(
            unitDriver.addValue(newUnitDriver, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(newUnitDriver);
        expect(mockedActor.addUnit).toHaveBeenCalled();
        expect(mockedActor.addUnit).toHaveBeenCalledWith(
            newUnitDriver,
            IndustrialSectorEnum.COFFEE
        );
    });

    it('should remove a value', async () => {
        const toRemove = 'unit';
        mockedActor.removeUnit.mockReturnValue(toRemove);
        await expect(
            unitDriver.removeValue(toRemove, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(toRemove);
        expect(mockedActor.removeUnit).toHaveBeenCalled();
        expect(mockedActor.removeUnit).toHaveBeenCalledWith(toRemove, IndustrialSectorEnum.COFFEE);
    });

    it('should check if a value already exists', async () => {
        const value = 'unit';
        mockedActor.hasUnit.mockReturnValue(true);
        await expect(unitDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasUnit).toHaveBeenCalled();
        expect(mockedActor.hasUnit).toHaveBeenCalledWith(value);
    });
});
