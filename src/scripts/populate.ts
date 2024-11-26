import { Identity } from '@dfinity/agent';
import { ProcessTypeService } from '../services/ProcessTypeService';
import { ProcessTypeDriver } from '../drivers/ProcessTypeDriver';
import { AssessmentStandardService } from '../services/AssessmentStandardService';
import { AssessmentStandardDriver } from '../drivers/AssessmentStandardDriver';
import { AssessmentAssuranceLevelService } from '../services/AssessmentAssuranceLevelService';
import { AssessmentAssuranceLevelDriver } from '../drivers/AssessmentAssuranceLevelDriver';
import { FiatService } from '../services/FiatService';
import { FiatDriver } from '../drivers/FiatDriver';
import { UnitService } from '../services/UnitService';
import { UnitDriver } from '../drivers/UnitDriver';
import { AuthHelper, Login } from '../__shared__/helpers/AuthHelper';
import { USERS } from '../__shared__/constants/constants';

const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const ICP_HOST = 'http://127.0.0.1:4943/';

const login = async () => {
    const user: Login = await AuthHelper.prepareLogin(
        USERS.USER1_PRIVATE_KEY,
        USERS.COMPANY1_PRIVATE_KEY
    );
    await user.authenticate();

    return user.siweIdentityProvider.identity;
};

const processTypePopulate = async (identity: Identity) => {
    console.log('Loading process types...');
    const processTypeService = new ProcessTypeService(
        new ProcessTypeDriver(identity, ENTITY_MANAGER_CANISTER_ID, ICP_HOST)
    );
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    await Promise.all(
        processTypes.map(async (processType) => {
            await processTypeService.addValue(processType);
        })
    );
};

const assessmentStandardPopulate = async (identity: Identity) => {
    console.log('Loading assessment standards...');
    const assessmentStandardService = new AssessmentStandardService(
        new AssessmentStandardDriver(identity, ENTITY_MANAGER_CANISTER_ID, ICP_HOST)
    );
    const assessmentStandards = [
        'Chemical use assessment',
        'Environment assessment',
        'Origin assessment',
        'Quality assessment',
        'Swiss Decode'
    ];
    await Promise.all(
        assessmentStandards.map(async (assessmentStandard) => {
            await assessmentStandardService.addValue(assessmentStandard);
        })
    );
};

const assessmentAssuranceLevelPopulate = async (identity: Identity) => {
    console.log('Loading assessment assurance levels...');
    const assessmentAssuranceLevelService = new AssessmentAssuranceLevelService(
        new AssessmentAssuranceLevelDriver(identity, ENTITY_MANAGER_CANISTER_ID, ICP_HOST)
    );
    const assessmentAssuranceLevels = [
        'Reviewed by peer members',
        'Self assessed',
        'Self declaration / Not verified',
        'Verified by second party',
        'Certified (Third Party)'
    ];
    await Promise.all(
        assessmentAssuranceLevels.map(async (assessmentAssuranceLevel) => {
            await assessmentAssuranceLevelService.addValue(assessmentAssuranceLevel);
        })
    );
};

const fiatPopulate = async (identity: Identity) => {
    console.log('Loading fiats...');
    const fiatService = new FiatService(
        new FiatDriver(identity, ENTITY_MANAGER_CANISTER_ID, ICP_HOST)
    );
    const fiats = ['CHF', 'USD', 'EUR'];
    await Promise.all(
        fiats.map(async (fiat) => {
            await fiatService.addValue(fiat);
        })
    );
};

const unitPopulate = async (identity: Identity) => {
    console.log('Loading units...');
    const unitService = new UnitService(
        new UnitDriver(identity, ENTITY_MANAGER_CANISTER_ID, ICP_HOST)
    );
    const units = ['BG - Bags', 'KGM - Kilograms', 'H87 - Pieces'];
    await Promise.all(
        units.map(async (unit) => {
            await unitService.addValue(unit);
        })
    );
};

(async () => {
    const identity = await login();
    await processTypePopulate(identity);
    await assessmentStandardPopulate(identity);
    await assessmentAssuranceLevelPopulate(identity);
    await fiatPopulate(identity);
    await unitPopulate(identity);
})();
