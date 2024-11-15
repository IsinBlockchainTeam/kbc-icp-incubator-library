import { IDL, query, update } from 'azle';
import FiatService from '../services/FiatService';
import { AtLeastSigner, AtLeastViewer } from '../decorators/roles';

class FiatController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllFiats(): Promise<string[]> {
        return FiatService.instance.getAllValues();
    }

    @update([IDL.Text], IDL.Text)
    @AtLeastSigner
    async addFiat(value: string): Promise<string> {
        return FiatService.instance.addValue(value);
    }

    @update([IDL.Text], IDL.Text)
    @AtLeastSigner
    async removeFiat(value: string): Promise<string> {
        return FiatService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasFiat(value: string): Promise<boolean> {
        return FiatService.instance.hasValue(value);
    }
}

export default FiatController;
