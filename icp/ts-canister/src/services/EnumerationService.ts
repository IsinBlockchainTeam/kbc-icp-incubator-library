import { StableBTreeMap } from 'azle';
import { StableMemoryId } from '../utils/stableMemory';

abstract class EnumerationService {
    protected _enumerations;

    private readonly _valuesKey: bigint;

    protected constructor(mapId: StableMemoryId) {
        this._enumerations = StableBTreeMap<bigint, string[]>(mapId);
        this._valuesKey = BigInt(mapId.valueOf());
        this._enumerations.insert(this._valuesKey, []);
    }

    static get instance(): EnumerationService {
        throw new Error("Method 'instance()' must be implemented in subclasses.");
    }

    getAllValues(): string[] {
        return this._enumerations.get(this._valuesKey) || [];
    }

    addValue(value: string): string {
        if (this.hasValue(value)) throw new Error('Enumeration value already exists');
        this._enumerations.insert(this._valuesKey, [...this.getAllValues(), value]);
        return value;
    }

    removeValue(value: string): string {
        if (!this.hasValue(value)) throw new Error('Enumeration value does not exist');
        this._enumerations.insert(
            this._valuesKey,
            this.getAllValues().filter((v) => v !== value)
        );
        return value;
    }

    hasValue(value: string): boolean {
        return this.getAllValues().includes(value);
    }
}

export default EnumerationService;
