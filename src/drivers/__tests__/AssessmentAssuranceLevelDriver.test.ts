import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { AssessmentAssuranceLevelDriver } from '../AssessmentAssuranceLevelDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('AssessmentAssuranceLevelDriver', () => {
    let assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver;
    const mockedActor = {
        getAllAssessmentAssuranceLevels: jest.fn(),
        addAssessmentAssuranceLevel: jest.fn(),
        removeAssessmentAssuranceLevel: jest.fn(),
        hasAssessmentAssuranceLevel: jest.fn()
    };
    const assessmentAssuranceLevel = 'assessmentAssuranceLevel1';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllAssessmentAssuranceLevels: mockedActor.getAllAssessmentAssuranceLevels,
            addAssessmentAssuranceLevel: mockedActor.addAssessmentAssuranceLevel,
            removeAssessmentAssuranceLevel: mockedActor.removeAssessmentAssuranceLevel,
            hasAssessmentAssuranceLevel: mockedActor.hasAssessmentAssuranceLevel
        });
        const icpIdentity = {} as Identity;
        assessmentAssuranceLevelDriver = new AssessmentAssuranceLevelDriver(
            icpIdentity,
            'canisterId'
        );
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllAssessmentAssuranceLevels.mockReturnValue([assessmentAssuranceLevel]);
        await expect(assessmentAssuranceLevelDriver.getAllValues()).resolves.toEqual([
            assessmentAssuranceLevel
        ]);
        expect(mockedActor.getAllAssessmentAssuranceLevels).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newAssessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        mockedActor.addAssessmentAssuranceLevel.mockReturnValue(newAssessmentAssuranceLevel);
        await expect(
            assessmentAssuranceLevelDriver.addValue(newAssessmentAssuranceLevel)
        ).resolves.toEqual(newAssessmentAssuranceLevel);
        expect(mockedActor.addAssessmentAssuranceLevel).toHaveBeenCalled();
        expect(mockedActor.addAssessmentAssuranceLevel).toHaveBeenCalledWith(
            newAssessmentAssuranceLevel
        );
    });

    it('should remove a value', async () => {
        const toRemove = 'assessmentAssuranceLevel1';
        mockedActor.removeAssessmentAssuranceLevel.mockReturnValue(toRemove);
        await expect(assessmentAssuranceLevelDriver.removeValue(toRemove)).resolves.toEqual(
            toRemove
        );
        expect(mockedActor.removeAssessmentAssuranceLevel).toHaveBeenCalled();
        expect(mockedActor.removeAssessmentAssuranceLevel).toHaveBeenCalledWith(toRemove);
    });

    it('should check if a value already exists', async () => {
        const value = 'assessmentAssuranceLevel1';
        mockedActor.hasAssessmentAssuranceLevel.mockReturnValue(true);
        await expect(assessmentAssuranceLevelDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasAssessmentAssuranceLevel).toHaveBeenCalled();
        expect(mockedActor.hasAssessmentAssuranceLevel).toHaveBeenCalledWith(value);
    });
});
