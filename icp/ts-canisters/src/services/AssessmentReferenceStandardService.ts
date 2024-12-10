import { StableBTreeMap } from 'azle';
import { AssessmentReferenceStandard, IndustrialSectorEnum, industrialSectorsAvailable } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import { AssessmentReferenceStandardNotFoundError } from '../models/errors/AssessmentReferenceStandardError';
import SustainabilityCriteriaService from './SustainabilityCriteriaService';
import { EnumerationNotFoundError } from '../models/errors/EnumerationError';
import { EnumerationType } from './EnumerationService';
import AuthenticationService from './AuthenticationService';
import { InvalidIndustrialSectorError } from '../models/errors/OrganizationError';

class AssessmentReferenceStandardService {
    private static _instance: AssessmentReferenceStandardService;

    // map<industrial_code_value, assessment_reference_standard[]>
    private _assessmentReferenceStandards = StableBTreeMap<string, AssessmentReferenceStandard[]>(StableMemoryId.ASSESSMENT_STANDARD);

    private readonly _industrialSectorCode: IndustrialSectorEnum;

    static get instance(): AssessmentReferenceStandardService {
        if (!this._instance) {
            this._instance = new AssessmentReferenceStandardService();
        }
        return this._instance;
    }

    constructor() {
        this._industrialSectorCode = AuthenticationService.instance.getLoggedOrganization().industrialSector as IndustrialSectorEnum;
    }

    getAll(): AssessmentReferenceStandard[] {
        return [...this._getDefaultIndustrialSectorValues(), ...this._getIndustrialSectorValues()];
    }

    getById(id: bigint): AssessmentReferenceStandard {
        const standard = this.getAll().find((s) => s.id === id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);
        return standard;
    }

    // TODO: industrial sector argument is needed to let the admin able to add assessment standards for other industrial sectors
    add(name: string, sustainabilityCriteria: string, logoUrl: string, siteUrl: string, industrialSector: string): AssessmentReferenceStandard {
        if (!SustainabilityCriteriaService.instance.hasValue(sustainabilityCriteria))
            throw new EnumerationNotFoundError(EnumerationType.SUSTAINABILITY_CRITERIA);
        const standard = {
            id: BigInt(this._assessmentReferenceStandards.keys().length + 1),
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        };
        if (industrialSector && industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        if (industrialSector) this._assessmentReferenceStandards.insert(industrialSector, [...this._getIndustrialSectorValues(), standard]);
        else this._assessmentReferenceStandards.insert(IndustrialSectorEnum.DEFAULT, [...this._getDefaultIndustrialSectorValues(), standard]);
        return standard;
    }

    remove(id: bigint, industrialSector: string): AssessmentReferenceStandard {
        const standard = this.getAll().find((s) => s.id === id);
        if (!standard) throw new AssessmentReferenceStandardNotFoundError(id);

        if (industrialSector && industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        if (industrialSector)
            this._assessmentReferenceStandards.insert(
                industrialSector,
                this._getIndustrialSectorValues().filter((s) => s.id !== id)
            );
        else
            this._assessmentReferenceStandards.insert(
                IndustrialSectorEnum.DEFAULT,
                this._getDefaultIndustrialSectorValues().filter((s) => s.id !== id)
            );
        return standard;
    }

    private _getDefaultIndustrialSectorValues(): AssessmentReferenceStandard[] {
        return this._assessmentReferenceStandards.get(IndustrialSectorEnum.DEFAULT) || [];
    }

    private _getIndustrialSectorValues(): AssessmentReferenceStandard[] {
        return this._assessmentReferenceStandards.get(this._industrialSectorCode) || [];
    }
}

export default AssessmentReferenceStandardService;
