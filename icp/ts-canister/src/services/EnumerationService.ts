import { StableBTreeMap } from 'azle';
import { Enumeration, EnumerationKey } from '../models/Enumeration';
import { StableMemoryId } from '../utils/stableMemory';

class EnumerationService {
    private static _instance: EnumerationService;

    private _enumerations = StableBTreeMap<EnumerationKey, string[]>(StableMemoryId.ENUMERATIONS);

    static get instance() {
        if (!EnumerationService._instance) {
            EnumerationService._instance = new EnumerationService();
        }
        return EnumerationService._instance;
    }

    getEnumerationsByType(enumeration: Enumeration): string[] {
        const enumKey = this._getKeyFromEnumeration(enumeration);
        return this._enumerations.get(enumKey) || [];
    }

    addEnumerationValue(enumeration: Enumeration, value: string): void {
        const enumKey = this._getKeyFromEnumeration(enumeration);
        if (this.hasEnumerationValue(enumeration, value)) throw new Error('Enumeration value already exists');
        console.log('this._enumerations.containsKey(enumKey): ', this._enumerations.containsKey(enumKey));
        console.log('this._enumerations.get(enumKey): ', this._enumerations.get(enumKey));
        if (!this._enumerations.containsKey(enumKey)) this._enumerations.insert(enumKey, [value]);
        else this._enumerations.insert(enumKey, [...this.getEnumerationsByType(enumeration), value]);
    }

    removeEnumerationValue(enumeration: Enumeration, value: string): void {
        const enumKey = this._getKeyFromEnumeration(enumeration);
        if (!this.hasEnumerationValue(enumeration, value)) throw new Error('Enumeration value does not exist');
        this._enumerations.insert(
            enumKey,
            this.getEnumerationsByType(enumeration).filter((v) => v !== value)
        );
    }

    hasEnumerationValue(enumeration: Enumeration, value: string): boolean {
        return this.getEnumerationsByType(enumeration).includes(value);
    }

    _getKeyFromEnumeration(enumeration: Enumeration): EnumerationKey {
        if (EnumerationKey.ASSESSMENT_STANDARD in enumeration) return EnumerationKey.ASSESSMENT_STANDARD;
        if (EnumerationKey.PROCESS_TYPE in enumeration) return EnumerationKey.PROCESS_TYPE;
        if (EnumerationKey.ASSESSMENT_ASSURANCE_LEVEL in enumeration) return EnumerationKey.ASSESSMENT_ASSURANCE_LEVEL;
        throw new Error('Invalid enumeration type');
    }
}

export default EnumerationService;
