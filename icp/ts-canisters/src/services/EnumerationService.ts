import { StableBTreeMap } from 'azle';
import { StableMemoryId } from '../utils/stableMemory';
import { EnumerationAlreadyExistsError, EnumerationNotFoundError } from '../models/errors/EnumerationError';
import { IndustrialSectorEnum, industrialSectorsAvailable } from '../models/types';
import AuthenticationService from './AuthenticationService';
import { InvalidIndustrialSectorError } from '../models/errors/OrganizationError';

export enum EnumerationType {
    ASSESSMENT_ASSURANCE_LEVEL = 'Assessment Assurance Level',
    FIAT = 'Fiat',
    PROCESS_TYPE = 'Process Type',
    SUSTAINABILITY_CRITERIA = 'Sustainability Criteria',
    UNIT = 'Unit'
}

abstract class EnumerationService {
    // map<industrial_code_value, enumeration_value[]>
    protected _enumerations;

    private readonly _type: EnumerationType;

    protected constructor(enumerationsMapId: StableMemoryId, type: EnumerationType) {
        this._type = type;
        this._enumerations = StableBTreeMap<string, string[]>(enumerationsMapId);
        // TODO: think about changing the way to get the industrial sector code, the admin is the only one who can add enumerations and maybe
        //  it doesn't need to be related to an industrial sector (or it could have DEFAULT one, but still able to add enumeration values for other industrial sectors)
    }

    static get instance(): EnumerationService {
        throw new Error("Method 'instance()' must be implemented in subclasses.");
    }

    getAllValues(industrialSector?: string): string[] {
        return [...this._getDefaultIndustrialSectorValues(), ...this._getIndustrialSectorValues(industrialSector || AuthenticationService.instance.getLoggedOrganization().industrialSector)];
    }

    // industrial sector argument is needed to let the admin able to add enumerations for other industrial sectors
    addValue(value: string, industrialSector: string): string {
        if (this.hasValue(value, industrialSector)) throw new EnumerationAlreadyExistsError();
        if (industrialSector && !industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        if (industrialSector) this._enumerations.insert(industrialSector, [...this._getIndustrialSectorValues(industrialSector), value]);
        else this._enumerations.insert(IndustrialSectorEnum.DEFAULT, [...this._getDefaultIndustrialSectorValues(), value]);
        return value;
    }

    removeValue(value: string, industrialSector: string): string {
        if (!this.hasValue(value, industrialSector)) throw new EnumerationNotFoundError(this._type);
        if (industrialSector && !industrialSectorsAvailable.includes(industrialSector)) throw new InvalidIndustrialSectorError();
        if (industrialSector)
            this._enumerations.insert(
                industrialSector,
                this._getIndustrialSectorValues(industrialSector).filter((v) => v !== value)
            );
        else
            this._enumerations.insert(
                IndustrialSectorEnum.DEFAULT,
                this._getDefaultIndustrialSectorValues().filter((v) => v !== value)
            );
        return value;
    }

    hasValue(value: string, industrialSector?: string): boolean {
        return this.getAllValues(industrialSector).includes(value);
    }

    private _getIndustrialSectorValues(industrialSector: string): string[] {
        return this._enumerations.get(industrialSector) || [];
    }

    private _getDefaultIndustrialSectorValues(): string[] {
        return this._enumerations.get(IndustrialSectorEnum.DEFAULT) || [];
    }
}

export default EnumerationService;
