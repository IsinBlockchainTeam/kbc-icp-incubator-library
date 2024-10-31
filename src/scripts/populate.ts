import { Wallet } from 'ethers';
import { Identity } from '@dfinity/agent';
import { SiweIdentityProvider } from '../drivers/icp/SiweIdentityProvider';
import { AuthenticationDriver } from '../drivers/icp/AuthenticationDriver';
import { AuthenticationService } from '../services/icp/AuthenticationService';
import { computeRoleProof } from '../drivers/icp/proof';
import { AssessmentStandardService } from '../services/icp/AssessmentStandardService';
import { AssessmentStandardDriver } from '../drivers/icp/AssessmentStandardDriver';
import { AssessmentAssuranceLevelDriver } from '../drivers/icp/AssessmentAssuranceLevelDriver';
import { AssessmentAssuranceLevelService } from '../services/icp/AssessmentAssuranceLevelService';
import { FiatService } from '../services/icp/FiatService';
import { FiatDriver } from '../drivers/icp/FiatDriver';
import { UnitService } from '../services/icp/UnitService';
import { UnitDriver } from '../drivers/icp/UnitDriver';
import { ProcessTypeService } from '../services/icp/ProcessTypeService';
import { ProcessTypeDriver } from '../drivers/icp/ProcessTypeDriver';

const USER_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const ICP_HOST = 'http://127.0.0.1:4943/';

const login = async () => {
    const userWallet = new Wallet(USER_PRIVATE_KEY);
    const companyWallet = new Wallet(COMPANY_PRIVATE_KEY);
    const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
    await siweIdentityProvider.createIdentity();

    const authenticationDriver = new AuthenticationDriver(
        siweIdentityProvider.identity,
        ENTITY_MANAGER_CANISTER_ID,
        ICP_HOST
    );
    const authenticationService = new AuthenticationService(authenticationDriver);
    const roleProof = await computeRoleProof(
        userWallet.address,
        'Signer',
        DELEGATE_CREDENTIAL_ID_HASH,
        DELEGATOR_CREDENTIAL_ID_HASH,
        companyWallet
    );
    await authenticationService.login(roleProof);

    return siweIdentityProvider.identity;
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
