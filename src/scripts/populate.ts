import { Identity } from '@dfinity/agent';
import { IndustrialSectorEnum, OrganizationRole } from '@kbc-lib/azle-types';
import { ProcessTypeService } from '../services/ProcessTypeService';
import { ProcessTypeDriver } from '../drivers/ProcessTypeDriver';
import { AssessmentReferenceStandardService } from '../services/AssessmentReferenceStandardService';
import { AssessmentReferenceStandardDriver } from '../drivers/AssessmentReferenceStandardDriver';
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
import { OrganizationService } from '../services/OrganizationService';
import { OrganizationDriver } from '../drivers/OrganizationDriver';

const login = async () => {
    console.log('Logging in...');
    const user: Login = await AuthHelper.prepareLogin(
        USERS.OTHER_USER_PRIVATE_KEY,
        USERS.OTHER_COMPANY_PRIVATE_KEY
    );
    await user.authenticate();
    const userIdentity = user.siweIdentityProvider.identity;

    const organizationService = new OrganizationService(
        new OrganizationDriver(userIdentity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );
    await organizationService.createOrganization({
        legalName: 'KBC',
        industrialSector: IndustrialSectorEnum.COFFEE,
        address: 'KBC Address',
        city: 'KBC city',
        postalCode: '12345',
        region: 'KBC region',
        countryCode: 'CH',
        role: OrganizationRole.ADMIN,
        telephone: '123456789',
        email: 'kbc@mail.ch',
        image: 'https://www.kbc.com'
    });

    return userIdentity;
};

const processTypePopulate = async (identity: Identity) => {
    console.log('Loading process types...');
    const processTypeService = new ProcessTypeService(
        new ProcessTypeDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );
    const processTypes: { name: string; industrialSector: string }[] = [
        { name: '28 - Trading', industrialSector: IndustrialSectorEnum.DEFAULT },
        { name: '33 - Collecting', industrialSector: IndustrialSectorEnum.DEFAULT },
        { name: '37 - Manufacturing', industrialSector: IndustrialSectorEnum.DEFAULT },
        { name: '137 - Splitting/shaving/sorting', industrialSector: IndustrialSectorEnum.COFFEE },
        { name: '38 - Harvesting', industrialSector: IndustrialSectorEnum.COFFEE },
        { name: '137 - Splitting/shaving/sorting', industrialSector: IndustrialSectorEnum.COTTON },
        { name: '38 - Harvesting', industrialSector: IndustrialSectorEnum.COTTON },
        { name: '113 - Finishing/Branding', industrialSector: IndustrialSectorEnum.COTTON }
    ];
    await Promise.all(
        processTypes.map(async (processType) => {
            await processTypeService.addValue(processType.name, processType.industrialSector);
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
    const assessmentStandardService = new AssessmentReferenceStandardService(
        new AssessmentReferenceStandardDriver(identity, ICP.ENTITY_MANAGER_CANISTER_ID, ICP.NETWORK)
    );

    const assessmentStandards: {
        name: string;
        sustainabilityCriteria: string;
        siteUrl: string;
        logoUrl: string;
        industrialSector: string;
    }[] = [
        {
            name: 'B CORP',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://www.bcorporation.net/en-us/standards',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg/220px-Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg.png',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'EU Ecolabel',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://environment.ec.europa.eu/topics/circular-economy/eu-ecolabel-home_en',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/en/thumb/3/34/EU_Ecolabel_logo.svg/220px-EU_Ecolabel_logo.svg.png',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'FSLM Facility Social Labor Module',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://howtohigg.org/higg-fslm-verification-program/',
            logoUrl: 'https://qltysys.com/wp-content/uploads/2020/12/HI_Logo_WHT.png',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'ISO9001',
            sustainabilityCriteria: 'Origin',
            siteUrl: 'https://www.iso.org/iso-9001-quality-management.html',
            logoUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/ISO_9001-2015.svg/595px-ISO_9001-2015.svg.png?20200218083857',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'AEO FULL',
            sustainabilityCriteria: 'Origin',
            siteUrl: 'https://www.adm.gov.it/portale/ee/trader/aeo-authorized-economic-operator',
            logoUrl: 'https://thyracont-vacuum.com/wp-content/uploads/2018/07/aeo-logo-farbe.jpg',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'EOV',
            sustainabilityCriteria: 'Use of chemicals',
            siteUrl: 'https://www.landtomarket.com/eov',
            logoUrl:
                'https://savory.global/wp-content/uploads/2021/02/Screen-Shot-2021-02-18-at-2.50.38-PM-768x829.png',
            industrialSector: IndustrialSectorEnum.DEFAULT
        },
        {
            name: 'Supplier to Zero',
            sustainabilityCriteria: 'Use of chemicals',
            siteUrl: 'https://www.implementation-hub.org/supplier-to-zero',
            logoUrl:
                'https://uploads-ssl.webflow.com/5c6a740b46b3672a86f5552b/5ed68bd87b5de42ebccd0fb7_flp.png',
            industrialSector: IndustrialSectorEnum.COFFEE
        },
        {
            name: 'RFA - Rain Forest Alliance',
            sustainabilityCriteria: 'Social/environmental performance',
            siteUrl: 'https://www.rainforest-alliance.org/',
            logoUrl:
                'https://www.wwf.ch/sites/default/files/styles/guide_item_image_labels/public/2023-06/logo-rainforest-alliance-people-nature_c.jpg',
            industrialSector: IndustrialSectorEnum.COFFEE
        },
        {
            name: 'Haelixa DNA origin standard',
            sustainabilityCriteria: 'Origin',
            siteUrl: 'https://www.haelixa.com/',
            logoUrl:
                'https://res-5.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco/itcxeonqx6revolmtvhz',
            industrialSector: IndustrialSectorEnum.COTTON
        },
        {
            name: 'Supplier to Zero',
            sustainabilityCriteria: 'Use of chemicals',
            siteUrl: 'https://www.implementation-hub.org/supplier-to-zero',
            logoUrl:
                'https://uploads-ssl.webflow.com/5c6a740b46b3672a86f5552b/5ed68bd87b5de42ebccd0fb7_flp.png',
            industrialSector: IndustrialSectorEnum.COTTON
        }
    ];
    await Promise.all(
        assessmentStandards.map(async (assessmentReferenceStandard) => {
            await assessmentStandardService.add(
                assessmentReferenceStandard.name,
                assessmentReferenceStandard.sustainabilityCriteria,
                assessmentReferenceStandard.logoUrl,
                assessmentReferenceStandard.siteUrl,
                assessmentReferenceStandard.industrialSector
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
    const units: { name: string; industrialSector: string }[] = [
        { name: 'KGM - Kilograms', industrialSector: IndustrialSectorEnum.DEFAULT },
        { name: 'BG - Bags', industrialSector: IndustrialSectorEnum.COFFEE },
        { name: 'H87 - Pieces', industrialSector: IndustrialSectorEnum.COFFEE },
        { name: 'MTK - Square meters', industrialSector: IndustrialSectorEnum.COTTON },
        { name: 'MT - Meters', industrialSector: IndustrialSectorEnum.COTTON }
    ];
    await Promise.all(
        units.map(async (unit) => {
            await unitService.addValue(unit.name, unit.industrialSector);
        })
    );
};

(async () => {
    const identity = await login();
    await sustainabilityCriteriaPopulate(identity);
    await assessmentStandardPopulate(identity);
    await processTypePopulate(identity);
    await assessmentAssuranceLevelPopulate(identity);
    await fiatPopulate(identity);
    await unitPopulate(identity);
})();
