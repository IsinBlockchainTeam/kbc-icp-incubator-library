import { AssessmentReferenceStandard } from '../AssessmentReferenceStandard';

describe('AssessmentReferenceStandard', () => {
    let assessmentReferenceStandard: AssessmentReferenceStandard;
    const id = 1;
    const name = 'name';
    const sustainabilityCriteria = 'sustainabilityCriteria';
    const logoUrl = 'logoUrl';
    const siteUrl = 'siteUrl';

    beforeAll(() => {
        assessmentReferenceStandard = new AssessmentReferenceStandard(
            id,
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        );
    });

    it('should correctly initialize an assessment reference standard', () => {
        expect(assessmentReferenceStandard).toBeInstanceOf(AssessmentReferenceStandard);
        expect(assessmentReferenceStandard.id).toEqual(id);
        expect(assessmentReferenceStandard.name).toEqual(name);
        expect(assessmentReferenceStandard.sustainabilityCriteria).toEqual(sustainabilityCriteria);
        expect(assessmentReferenceStandard.logoUrl).toEqual(logoUrl);
        expect(assessmentReferenceStandard.siteUrl).toEqual(siteUrl);
    });

    it('should correctly set the id', () => {
        const newId = 2;
        assessmentReferenceStandard.id = newId;
        expect(assessmentReferenceStandard.id).toEqual(newId);
    });

    it('should correctly set the name', () => {
        const newName = 'newName';
        assessmentReferenceStandard.name = newName;
        expect(assessmentReferenceStandard.name).toEqual(newName);
    });

    it('should correctly set the sustainability criteria', () => {
        const newSustainabilityCriteria = 'newSustainabilityCriteria';
        assessmentReferenceStandard.sustainabilityCriteria = newSustainabilityCriteria;
        expect(assessmentReferenceStandard.sustainabilityCriteria).toEqual(
            newSustainabilityCriteria
        );
    });

    it('should correctly set the logo URL', () => {
        const newLogoUrl = 'newLogoUrl';
        assessmentReferenceStandard.logoUrl = newLogoUrl;
        expect(assessmentReferenceStandard.logoUrl).toEqual(newLogoUrl);
    });

    it('should correctly set the site URL', () => {
        const newSiteUrl = 'newSiteUrl';
        assessmentReferenceStandard.siteUrl = newSiteUrl;
        expect(assessmentReferenceStandard.siteUrl).toEqual(newSiteUrl);
    });
});
