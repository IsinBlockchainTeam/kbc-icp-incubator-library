import { StableBTreeMap } from 'azle';
import { EnumerationKey } from '../models/Enumeration';
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

    getEnumerationsByType(enumeration: EnumerationKey): string[] {
        return this._enumerations.get(enumeration) || [];
    }

    addEnumerationValue(enumeration: EnumerationKey, value: string): void {
        if (this.hasEnumerationValue(enumeration, value)) throw new Error('Enumeration value already exists');
        if (!this._enumerations.containsKey(enumeration)) this._enumerations.insert(enumeration, [value]);
        else this._enumerations.get(enumeration)!.push(value);
    }

    removeEnumerationValue(enumeration: EnumerationKey, value: string): void {
        if (!this.hasEnumerationValue(enumeration, value)) throw new Error('Enumeration value does not exist');
        this._enumerations.insert(
            enumeration,
            this.getEnumerationsByType(enumeration).filter((v) => v !== value)
        );
    }

    hasEnumerationValue(enumeration: EnumerationKey, value: string): boolean {
        return this.getEnumerationsByType(enumeration).includes(value);
    }
}

export default EnumerationService;
