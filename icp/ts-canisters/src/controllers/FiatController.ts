import { IDL, query, update } from 'azle';
import FiatService from '../services/FiatService';
import { AtLeastViewer } from '../decorators/roles';

class FiatController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllFiats(): Promise<string[]> {
        return FiatService.instance.getAllValues();
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async addFiat(value: string, industrialSector: string): Promise<string> {
        return FiatService.instance.addValue(value, industrialSector);
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async removeFiat(value: string, industrialSector: string): Promise<string> {
        return FiatService.instance.removeValue(value, industrialSector);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasFiat(value: string): Promise<boolean> {
        return FiatService.instance.hasValue(value);
    }
}

export default FiatController;
