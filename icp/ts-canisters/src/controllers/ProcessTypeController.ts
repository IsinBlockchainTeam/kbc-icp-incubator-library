import { IDL, query, update } from 'azle';
import ProcessTypeService from '../services/ProcessTypeService';
import { AtLeastViewer } from '../decorators/roles';

class ProcessTypeController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllProcessTypes(): Promise<string[]> {
        return ProcessTypeService.instance.getAllValues();
    }

    @update([IDL.Text], IDL.Text)
    async addProcessType(value: string): Promise<string> {
        return ProcessTypeService.instance.addValue(value);
    }

    @update([IDL.Text], IDL.Text)
    async removeProcessType(value: string): Promise<string> {
        return ProcessTypeService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasProcessType(value: string): Promise<boolean> {
        return ProcessTypeService.instance.hasValue(value);
    }
}

export default ProcessTypeController;
