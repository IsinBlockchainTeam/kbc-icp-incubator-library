import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { AssessmentStandardDriver } from '../AssessmentStandardDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('AssessmentStandardDriver', () => {
    let assessmentStandardDriver: AssessmentStandardDriver;
    const mockedActor = {
        getAllAssessmentStandards: jest.fn(),
        addAssessmentStandard: jest.fn(),
        removeAssessmentStandard: jest.fn(),
        hasAssessmentStandard: jest.fn()
    };
    const assessmentStandard = 'assessmentStandard';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllAssessmentStandards: mockedActor.getAllAssessmentStandards,
            addAssessmentStandard: mockedActor.addAssessmentStandard,
            removeAssessmentStandard: mockedActor.removeAssessmentStandard,
            hasAssessmentStandard: mockedActor.hasAssessmentStandard
        });
        const icpIdentity = {} as Identity;
        assessmentStandardDriver = new AssessmentStandardDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllAssessmentStandards.mockReturnValue([assessmentStandard]);
        await expect(assessmentStandardDriver.getAllValues()).resolves.toEqual([
            assessmentStandard
        ]);
        expect(mockedActor.getAllAssessmentStandards).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newAssessmentStandard = 'newAssessmentStandard';
        mockedActor.addAssessmentStandard.mockReturnValue(newAssessmentStandard);
        await expect(assessmentStandardDriver.addValue(newAssessmentStandard)).resolves.toEqual(
            newAssessmentStandard
        );
        expect(mockedActor.addAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.addAssessmentStandard).toHaveBeenCalledWith(newAssessmentStandard);
    });

    it('should remove a value', async () => {
        const toRemove = 'assessmentStandard';
        mockedActor.removeAssessmentStandard.mockReturnValue(toRemove);
        await expect(assessmentStandardDriver.removeValue(toRemove)).resolves.toEqual(toRemove);
        expect(mockedActor.removeAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.removeAssessmentStandard).toHaveBeenCalledWith(toRemove);
    });

    it('should check if a value already exists', async () => {
        const value = 'assessmentStandard';
        mockedActor.hasAssessmentStandard.mockReturnValue(true);
        await expect(assessmentStandardDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.hasAssessmentStandard).toHaveBeenCalledWith(value);
    });
});
