import { IDL, query, update } from 'azle';
import EnumerationService from '../services/EnumerationService';
import { Enumeration } from '../models/types';
import { Enumeration as IDLEnumeration } from '../models/idls/Enumeration';

class EnumerationController {
    @query([IDLEnumeration], IDL.Vec(IDL.Text))
    getEnumerationsByType(enumeration: Enumeration): string[] {
        return EnumerationService.instance.getEnumerationsByType(enumeration);
    }

    @update([IDLEnumeration, IDL.Text])
    addEnumerationValue(enumeration: Enumeration, value: string): void {
        EnumerationService.instance.addEnumerationValue(enumeration, value);
    }

    @update([IDLEnumeration, IDL.Text])
    removeEnumerationValue(enumeration: Enumeration, value: string): void {
        EnumerationService.instance.removeEnumerationValue(enumeration, value);
    }

    @query([IDLEnumeration, IDL.Text], IDL.Bool)
    hasEnumerationValue(enumeration: Enumeration, value: string): boolean {
        return EnumerationService.instance.hasEnumerationValue(enumeration, value);
    }
}

export default EnumerationController;
