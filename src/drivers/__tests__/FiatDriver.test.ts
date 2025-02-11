import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { FiatDriver } from '../FiatDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('FiatDriver', () => {
    let fiatDriver: FiatDriver;
    const mockedActor = {
        getAllFiats: jest.fn(),
        addFiat: jest.fn(),
        removeFiat: jest.fn(),
        hasFiat: jest.fn()
    };
    const fiat = 'fiat';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllFiats: mockedActor.getAllFiats,
            addFiat: mockedActor.addFiat,
            removeFiat: mockedActor.removeFiat,
            hasFiat: mockedActor.hasFiat
        });
        const icpIdentity = {} as Identity;
        fiatDriver = new FiatDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllFiats.mockReturnValue([fiat]);
        await expect(fiatDriver.getAllValues()).resolves.toEqual([fiat]);
        expect(mockedActor.getAllFiats).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newFiatDriver = 'newFiatDriver';
        mockedActor.addFiat.mockReturnValue(newFiatDriver);
        await expect(
            fiatDriver.addValue(newFiatDriver, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(newFiatDriver);
        expect(mockedActor.addFiat).toHaveBeenCalled();
        expect(mockedActor.addFiat).toHaveBeenCalledWith(
            newFiatDriver,
            IndustrialSectorEnum.COFFEE
        );
    });

    it('should remove a value', async () => {
        const toRemove = 'fiat';
        mockedActor.removeFiat.mockReturnValue(toRemove);
        await expect(
            fiatDriver.removeValue(toRemove, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(toRemove);
        expect(mockedActor.removeFiat).toHaveBeenCalled();
        expect(mockedActor.removeFiat).toHaveBeenCalledWith(toRemove, IndustrialSectorEnum.COFFEE);
    });

    it('should check if a value already exists', async () => {
        const value = 'fiat';
        mockedActor.hasFiat.mockReturnValue(true);
        await expect(fiatDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasFiat).toHaveBeenCalled();
        expect(mockedActor.hasFiat).toHaveBeenCalledWith(value);
    });
});
