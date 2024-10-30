import { IDL, query, update } from 'azle';
import ProcessTypeService from '../services/ProcessTypeService';

class ProcessTypeController {
    @query([], IDL.Vec(IDL.Text))
    getAllProcessTypes(): string[] {
        return ProcessTypeService.instance.getAllValues();
    }

    @update([IDL.Text])
    addProcessType(value: string): void {
        ProcessTypeService.instance.addValue(value);
    }

    @update([IDL.Text])
    removeProcessType(value: string): void {
        ProcessTypeService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    hasProcessType(value: string): boolean {
        return ProcessTypeService.instance.hasValue(value);
    }
}

export default ProcessTypeController;
