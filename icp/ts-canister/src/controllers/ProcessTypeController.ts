import { IDL, query, update } from 'azle';
import ProcessTypeService from '../services/ProcessTypeService';
import { AtLeastSigner, AtLeastViewer } from '../decorators/roles';

class ProcessTypeController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllProcessTypes(): Promise<string[]> {
        return ProcessTypeService.instance.getAllValues();
    }

    @update([IDL.Text])
    @AtLeastSigner
    async addProcessType(value: string): Promise<void> {
        ProcessTypeService.instance.addValue(value);
    }

    @update([IDL.Text])
    @AtLeastSigner
    async removeProcessType(value: string): Promise<void> {
        ProcessTypeService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasProcessType(value: string): Promise<boolean> {
        return ProcessTypeService.instance.hasValue(value);
    }
}

export default ProcessTypeController;
