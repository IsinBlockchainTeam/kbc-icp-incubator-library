import { StableBTreeMap } from 'azle';
import { AssessmentReferenceStandard } from '../models/types/src/AssessmentReferenceStandard';
import { StableMemoryId } from '../utils/stableMemory';
import { AssessmentReferenceStandardNotFoundError } from '../models/errors/AssessmentReferenceStandardError';
import SustainabilityCriteriaService from './SustainabilityCriteriaService';
import { EnumerationNotFoundError } from '../models/errors/EnumerationError';
import { EnumerationType } from './EnumerationService';

class AssessmentReferenceStandardService {
    private static _instance: AssessmentReferenceStandardService;

    private _assessmentStandards = StableBTreeMap<bigint, AssessmentReferenceStandard>(StableMemoryId.ASSESSMENT_STANDARD);

    static get instance(): AssessmentReferenceStandardService {
        if (!this._instance) {
            this._instance = new AssessmentReferenceStandardService();
        }
        return this._instance;
    }

    getAll(): AssessmentReferenceStandard[] {
        return this._assessmentStandards.values();
    }

    getById(id: bigint): AssessmentReferenceStandard {
        const assessmentReferenceStandard = this._assessmentStandards.get(id);
        if (!assessmentReferenceStandard) throw new AssessmentReferenceStandardNotFoundError(id);
        return assessmentReferenceStandard;
    }

    add(name: string, sustainabilityCriteria: string, logoUrl: string, siteUrl: string): AssessmentReferenceStandard {
        if (!SustainabilityCriteriaService.instance.hasValue(sustainabilityCriteria))
            throw new EnumerationNotFoundError(EnumerationType.SUSTAINABILITY_CRITERIA);
        const standard = {
            id: BigInt(this._assessmentStandards.keys().length + 1),
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        };
        this._assessmentStandards.insert(BigInt(standard.id), standard);
        return standard;
    }

    update(id: bigint, name: string, sustainabilityCriteria: string, logoUrl: string, siteUrl: string): AssessmentReferenceStandard {
        if (!SustainabilityCriteriaService.instance.hasValue(sustainabilityCriteria))
            throw new EnumerationNotFoundError(EnumerationType.SUSTAINABILITY_CRITERIA);
        const standard = this._assessmentStandards.get(id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);

        standard.name = name;
        standard.sustainabilityCriteria = sustainabilityCriteria;
        standard.logoUrl = logoUrl;
        standard.siteUrl = siteUrl;

        this._assessmentStandards.insert(id, standard);
        return standard;
    }

    remove(id: bigint): AssessmentReferenceStandard {
        const standard = this._assessmentStandards.get(id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);

        this._assessmentStandards.remove(id);
        return standard;
    }
}

export default AssessmentReferenceStandardService;
