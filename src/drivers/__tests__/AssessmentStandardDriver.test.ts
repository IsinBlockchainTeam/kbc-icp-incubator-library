import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { AssessmentReferenceStandardDriver } from '../AssessmentReferenceStandardDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('AssessmentStandardDriver', () => {
    let assessmentStandardDriver: AssessmentReferenceStandardDriver;
    const mockedActor = {
        getAllAssessmentStandards: jest.fn(),
        addAssessmentStandard: jest.fn(),
        removeAssessmentStandard: jest.fn(),
        hasAssessmentStandard: jest.fn()
    };
    const assessmentReferenceStandard = 'assessmentReferenceStandard';

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllAssessmentStandards: mockedActor.getAllAssessmentStandards,
            addAssessmentStandard: mockedActor.addAssessmentStandard,
            removeAssessmentStandard: mockedActor.removeAssessmentStandard,
            hasAssessmentStandard: mockedActor.hasAssessmentStandard
        });
        const icpIdentity = {} as Identity;
        assessmentStandardDriver = new AssessmentReferenceStandardDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllAssessmentStandards.mockReturnValue([assessmentReferenceStandard]);
        await expect(assessmentStandardDriver.getAll()).resolves.toEqual([
            assessmentReferenceStandard
        ]);
        expect(mockedActor.getAllAssessmentStandards).toHaveBeenCalled();
    });

    it('should add a value', async () => {
        const newAssessmentStandard = 'newAssessmentStandard';
        mockedActor.addAssessmentStandard.mockReturnValue(newAssessmentStandard);
        await expect(assessmentStandardDriver.add(newAssessmentStandard)).resolves.toEqual(
            newAssessmentStandard
        );
        expect(mockedActor.addAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.addAssessmentStandard).toHaveBeenCalledWith(newAssessmentStandard);
    });

    it('should remove a value', async () => {
        const toRemove = 'assessmentReferenceStandard';
        mockedActor.removeAssessmentStandard.mockReturnValue(toRemove);
        await expect(assessmentStandardDriver.removeById(toRemove)).resolves.toEqual(toRemove);
        expect(mockedActor.removeAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.removeAssessmentStandard).toHaveBeenCalledWith(toRemove);
    });

    it('should check if a value already exists', async () => {
        const value = 'assessmentReferenceStandard';
        mockedActor.hasAssessmentStandard.mockReturnValue(true);
        await expect(assessmentStandardDriver.hasValue(value)).resolves.toBeTruthy();
        expect(mockedActor.hasAssessmentStandard).toHaveBeenCalled();
        expect(mockedActor.hasAssessmentStandard).toHaveBeenCalledWith(value);
    });
});
