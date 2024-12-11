import { StableBTreeMap } from 'azle';
import { AssessmentReferenceStandard, IndustrialSectorEnum, industrialSectorsAvailable } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import { AssessmentReferenceStandardNotFoundError } from '../models/errors/AssessmentReferenceStandardError';
import SustainabilityCriteriaService from './SustainabilityCriteriaService';
import { EnumerationNotFoundError } from '../models/errors/EnumerationError';
import { EnumerationType } from './EnumerationService';
import AuthenticationService from './AuthenticationService';
import { InvalidIndustrialSectorError } from '../models/errors/OrganizationError';
import { compareStrings } from '../utils/validation';

class AssessmentReferenceStandardService {
    private static _instance: AssessmentReferenceStandardService;

    // map<assessment_reference_standard_id, assessment_reference_standard>
    private _assessmentReferenceStandards = StableBTreeMap<bigint, AssessmentReferenceStandard>(StableMemoryId.ASSESSMENT_STANDARD);

    // map<industrial_code_value, assessment_reference_standard_id[]>
    private _industrialSectorStandards = StableBTreeMap<string, bigint[]>(StableMemoryId.ASSESSMENT_STANDARD_INDUSTRIAL_SECTOR);

    static get instance(): AssessmentReferenceStandardService {
        if (!this._instance) {
            this._instance = new AssessmentReferenceStandardService();
        }
        return this._instance;
    }

    getAll(): AssessmentReferenceStandard[] {
        return [...this._getDefaultIndustrialSectorValues(), ...this._getIndustrialSectorValues(AuthenticationService.instance.getLoggedOrganization().industrialSector)];
    }

    getById(id: bigint): AssessmentReferenceStandard {
        const standard = this._assessmentReferenceStandards.get(id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);
        return standard;
    }

    // TODO: industrial sector argument is needed to let the admin able to add assessment standards for other industrial sectors
    add(name: string, sustainabilityCriteria: string, logoUrl: string, siteUrl: string, industrialSector: string): AssessmentReferenceStandard {
        if (!SustainabilityCriteriaService.instance.hasValue(sustainabilityCriteria)) throw new EnumerationNotFoundError(EnumerationType.SUSTAINABILITY_CRITERIA);

        if (!industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        const oldStandard = this._assessmentReferenceStandards.values().find((s) => compareStrings(s.name, name) === 0);
        if (oldStandard) {
            this._industrialSectorStandards.insert(industrialSector, [...new Set([...this._getIndustrialSectorIds(industrialSector), oldStandard.id])]);
            return oldStandard;
        }
        const standard = {
            id: BigInt(this._assessmentReferenceStandards.values().length + 1),
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        };
        this._assessmentReferenceStandards.insert(standard.id, standard);
        this._industrialSectorStandards.insert(industrialSector, [...this._getIndustrialSectorIds(industrialSector), standard.id]);
        return standard;
    }

    update(id: bigint, name: string, sustainabilityCriteria: string, logoUrl: string, siteUrl: string): AssessmentReferenceStandard {
        const updatedStandard = {
            id,
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        };
        this._assessmentReferenceStandards.insert(id, updatedStandard);
        return updatedStandard;
    }

    remove(id: bigint, industrialSector: string): AssessmentReferenceStandard {
        const standard = this.getAll().find((s) => s.id === id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);

        if (!industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        this._industrialSectorStandards.insert(
            industrialSector,
            this._getIndustrialSectorIds(industrialSector).filter((s) => s !== id)
        );
        if (
            !this._industrialSectorStandards
                .values()
                .flat()
                .find((s) => s === id)
        )
            this._assessmentReferenceStandards.remove(id);

        return standard;
    }

    private _getDefaultIndustrialSectorIds(): bigint[] {
        return this._industrialSectorStandards.get(IndustrialSectorEnum.DEFAULT) || [];
    }

    private _getIndustrialSectorIds(industrialSector: string): bigint[] {
        return this._industrialSectorStandards.get(industrialSector) || [];
    }

    private _getDefaultIndustrialSectorValues(): AssessmentReferenceStandard[] {
        const standardsIds = this._getDefaultIndustrialSectorIds();
        return standardsIds.map((id) => this._assessmentReferenceStandards.get(id)!);
    }

    private _getIndustrialSectorValues(industrialSector: string): AssessmentReferenceStandard[] {
        const standardsIds = this._getIndustrialSectorIds(industrialSector);
        return standardsIds.map((id) => this._assessmentReferenceStandards.get(id)!);
    }
}

export default AssessmentReferenceStandardService;
