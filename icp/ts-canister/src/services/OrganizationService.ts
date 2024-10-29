class OrganizationService {
    private static _instance: OrganizationService;

    private constructor() {}
    static get instance() {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService();
        }
        return OrganizationService._instance;
    }
}

export default OrganizationService;
