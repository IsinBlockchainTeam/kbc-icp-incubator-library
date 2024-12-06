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
import { ICP, USERS } from '../__shared__/constants/constants';
import { SustainabilityCriteriaService } from '../services/SustainabilityCriteriaService';
import { SustainabilityCriteriaDriver } from '../drivers/SustainabilityCriteriaDriver';

const login = async () => {
    console.log('Logging in...');
    const user: Login = await AuthHelper.prepareLogin(
        USERS.OTHER_USER_PRIVATE_KEY,
        USERS.OTHER_COMPANY_PRIVATE_KEY
    );
    await user.authenticate();

    return user.siweIdentityProvider.identity;
};

const processTypePopulate = async (identity: Identity) => {
    console.log('Loading process types...');
    const processTypeService = new ProcessTypeService(
        new ProcessTypeDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );
    const processTypes = ['33 - Collecting', '38 - Harvesting'];
    await Promise.all(
        processTypes.map(async (processType) => {
            await processTypeService.addValue(processType);
        })
    );
};

const sustainabilityCriteriaPopulate = async (identity: Identity) => {
    console.log('Loading sustainability criteria...');
    const sustainabilityCriteriaService = new SustainabilityCriteriaService(
        new SustainabilityCriteriaDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );
    const sustainabilityCriteria = [
        'Use of chemicals',
        'Origin',
        'Social/environmental performance'
    ];
    await Promise.all(
        sustainabilityCriteria.map(async (criteria) => {
            await sustainabilityCriteriaService.addValue(criteria);
        })
    );
};

const assessmentStandardPopulate = async (identity: Identity) => {
    console.log('Loading assessment standards...');
    const assessmentStandardService = new AssessmentStandardService(
        new AssessmentStandardDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );

    const assessmentStandards = [
        {
            name: 'B CORP',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://www.bcorporation.net/en-us/standards',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg/220px-Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg.png'
        },
        {
            name: 'EU Ecolabel',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://environment.ec.europa.eu/topics/circular-economy/eu-ecolabel-home_en',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/en/thumb/3/34/EU_Ecolabel_logo.svg/220px-EU_Ecolabel_logo.svg.png'
        },
        {
            name: 'FSLM Facility Social Labor Module',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://howtohigg.org/higg-fslm-verification-program/',
            logoUrl: 'https://qltysys.com/wp-content/uploads/2020/12/HI_Logo_WHT.png'
        },
        {
            name: 'ISO9001',
            sustainabilityCriteria: 'Origin',
            siteUrl: 'https://www.iso.org/iso-9001-quality-management.html',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/ISO_9001-2015.svg/595px-ISO_9001-2015.svg.png?20200218083857'
        },
        {
            name: 'AEO FULL',
            sustainabilityCriteria: 'Origin',
            siteUrl: 'https://www.adm.gov.it/portale/ee/trader/aeo-authorized-economic-operator',
            logoUrl: 'https://thyracont-vacuum.com/wp-content/uploads/2018/07/aeo-logo-farbe.jpg'
        },
        {
            name: 'EOV',
            sustainabilityCriteria: 'Use of chemicals',
            siteUrl: 'https://www.landtomarket.com/eov',
            logoUrl:
                'https://savory.global/wp-content/uploads/2021/02/Screen-Shot-2021-02-18-at-2.50.38-PM-768x829.png'
        },
        {
            name: 'Supplier to Zero',
            sustainabilityCriteria: 'Use of chemicals',
            siteUrl: 'https://www.implementation-hub.org/supplier-to-zero',
            logoUrl:
                'https://uploads-ssl.webflow.com/5c6a740b46b3672a86f5552b/5ed68bd87b5de42ebccd0fb7_flp.png'
        },
        {
            name: 'RFA - Rain Forest Alliance',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://www.rainforest-alliance.org/',
            logoUrl:
                'https://www.wwf.ch/sites/default/files/styles/guide_item_image_labels/public/2023-06/logo-rainforest-alliance-people-nature_c.jpg'
        }
    ];
    await Promise.all(
        assessmentStandards.map(async (assessmentStandard) => {
            await assessmentStandardService.add(
                assessmentStandard.name,
                assessmentStandard.sustainabilityCriteria,
                assessmentStandard.logoUrl,
                assessmentStandard.siteUrl
            );
        })
    );
};

const assessmentAssuranceLevelPopulate = async (identity: Identity) => {
    console.log('Loading assessment assurance levels...');
    const assessmentAssuranceLevelService = new AssessmentAssuranceLevelService(
        new AssessmentAssuranceLevelDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
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
        new FiatDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
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
        new UnitDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
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
    await sustainabilityCriteriaPopulate(identity);
    await processTypePopulate(identity);
    await assessmentStandardPopulate(identity);
    await assessmentAssuranceLevelPopulate(identity);
    await fiatPopulate(identity);
    await unitPopulate(identity);
})();
