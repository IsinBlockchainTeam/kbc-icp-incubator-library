import { IDL, query, update } from 'azle';
import FiatService from '../services/FiatService';

class FiatController {
    @query([], IDL.Vec(IDL.Text))
    getAllFiats(): string[] {
        return FiatService.instance.getAllValues();
    }

    @update([IDL.Text])
    addFiat(value: string): void {
        FiatService.instance.addValue(value);
    }

    @update([IDL.Text])
    removeFiat(value: string): void {
        FiatService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    hasFiat(value: string): boolean {
        return FiatService.instance.hasValue(value);
    }
}

export default FiatController;
