import { IDL, query } from 'azle';
import EnumerationService from '../services/EnumerationService';
import { EnumerationKey } from '../models/Enumeration';

class EnumerationController {
    @query([IDL.Text], IDL.Vec(IDL.Text))
    getEnumerationsByType(enumeration: EnumerationKey): string[] {
        return EnumerationService.instance.getEnumerationsByType(enumeration);
    }
}

export default EnumerationController;
