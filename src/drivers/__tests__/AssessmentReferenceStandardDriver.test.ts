import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { AssessmentReferenceStandardDriver } from '../AssessmentReferenceStandardDriver';
import { AssessmentReferenceStandard } from '../../entities/AssessmentReferenceStandard';
import { EntityBuilder } from '../../utils/EntityBuilder';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('AssessmentReferenceStandardDriver', () => {
    let assessmentStandardDriver: AssessmentReferenceStandardDriver;
    const mockedActor = {
        getAllAssessmentReferenceStandards: jest.fn(),
        getAssessmentReferenceStandard: jest.fn(),
        addAssessmentReferenceStandard: jest.fn(),
        removeAssessmentReferenceStandard: jest.fn()
    };
    const assessmentReferenceStandard = { id: 2 } as AssessmentReferenceStandard;

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getAllAssessmentReferenceStandards: mockedActor.getAllAssessmentReferenceStandards,
            getAssessmentReferenceStandard: mockedActor.getAssessmentReferenceStandard,
            addAssessmentReferenceStandard: mockedActor.addAssessmentReferenceStandard,
            removeAssessmentReferenceStandard: mockedActor.removeAssessmentReferenceStandard
        });
        const icpIdentity = {} as Identity;
        assessmentStandardDriver = new AssessmentReferenceStandardDriver(icpIdentity, 'canisterId');

        jest.spyOn(EntityBuilder, 'buildAssessmentReferenceStandard').mockReturnValue(
            assessmentReferenceStandard
        );
    });

    it('should retrieve all values', async () => {
        mockedActor.getAllAssessmentReferenceStandards.mockReturnValue([
            assessmentReferenceStandard
        ]);
        await expect(assessmentStandardDriver.getAll()).resolves.toEqual([
            assessmentReferenceStandard
        ]);
        expect(mockedActor.getAllAssessmentReferenceStandards).toHaveBeenCalled();
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalled();
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalledWith(
            assessmentReferenceStandard
        );
    });

    it('should retrieve value by id', async () => {
        mockedActor.getAssessmentReferenceStandard.mockReturnValue(assessmentReferenceStandard);
        await expect(assessmentStandardDriver.getById(2)).resolves.toEqual(
            assessmentReferenceStandard
        );
        expect(mockedActor.getAssessmentReferenceStandard).toHaveBeenCalled();
        expect(mockedActor.getAssessmentReferenceStandard).toHaveBeenCalledWith(BigInt(2));
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalled();
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalledWith(
            assessmentReferenceStandard
        );
    });

    it('should add a value', async () => {
        const newAssessmentStandard = {
            name: 'new standard',
            logoUrl: 'logo',
            siteUrl: 'siteUrl',
            sustainabilityCriteria: 'criteria'
        };
        mockedActor.addAssessmentReferenceStandard.mockReturnValue(newAssessmentStandard);
        jest.spyOn(EntityBuilder, 'buildAssessmentReferenceStandard').mockReturnValueOnce({
            id: 4,
            ...newAssessmentStandard
        } as AssessmentReferenceStandard);
        await expect(
            assessmentStandardDriver.add(
                newAssessmentStandard.name,
                newAssessmentStandard.sustainabilityCriteria,
                newAssessmentStandard.logoUrl,
                newAssessmentStandard.siteUrl,
                IndustrialSectorEnum.COFFEE
            )
        ).resolves.toEqual({
            id: 4,
            ...newAssessmentStandard
        });
        expect(mockedActor.addAssessmentReferenceStandard).toHaveBeenCalled();
        expect(mockedActor.addAssessmentReferenceStandard).toHaveBeenCalledWith(
            newAssessmentStandard.name,
            newAssessmentStandard.sustainabilityCriteria,
            newAssessmentStandard.logoUrl,
            newAssessmentStandard.siteUrl,
            IndustrialSectorEnum.COFFEE
        );
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalled();
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalledWith(
            newAssessmentStandard
        );
    });

    it('should remove a value by id', async () => {
        const idToRemove = 2;
        mockedActor.removeAssessmentReferenceStandard.mockReturnValue(assessmentReferenceStandard);
        await expect(
            assessmentStandardDriver.removeById(idToRemove, IndustrialSectorEnum.COFFEE)
        ).resolves.toEqual(assessmentReferenceStandard);
        expect(mockedActor.removeAssessmentReferenceStandard).toHaveBeenCalled();
        expect(mockedActor.removeAssessmentReferenceStandard).toHaveBeenCalledWith(
            BigInt(idToRemove),
            IndustrialSectorEnum.COFFEE
        );
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalled();
        expect(EntityBuilder.buildAssessmentReferenceStandard).toHaveBeenCalledWith(
            assessmentReferenceStandard
        );
    });
});
