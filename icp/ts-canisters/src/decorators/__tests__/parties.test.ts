import AuthenticationService from "../../services/AuthenticationService";
import { HasInterestedParties } from '../../services/interfaces/HasInterestedParties';
import { OnlyContractParty, OnlySupplier, OnlyCommissioner } from "../parties";
import {HasSupplier} from "../../services/interfaces/HasSupplier";
import {HasCommissioner} from "../../services/interfaces/HasCommissioner";

jest.mock("../../services/AuthenticationService", () => ({
    instance: {
        getDelegatorAddress: jest.fn(),
        getLoggedOrganization: jest.fn(),
    }
}));

describe("Party Decorators", () => {
    const mockMethod = jest.fn();
    const hasInterestedParties: HasInterestedParties = {
        getInterestedParties: jest.fn(),
    };
    const hasSupplier: HasSupplier = {
        getSupplier: jest.fn(),
    };
    const hasCommissioner: HasCommissioner = {
        getCommissioner: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("OnlyContractParty", () => {
        it("calls the original method if the user is an interested party", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.getLoggedOrganization as jest.Mock).mockReturnValue({ ethAddress: "testCompany" });
            (hasInterestedParties.getInterestedParties as jest.Mock).mockReturnValue(["testUser", "testCompany"]);

            const decoratedMethod = OnlyContractParty(hasInterestedParties)(mockMethod, {});
            await decoratedMethod("entityId");

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws an error if the user is not an interested party", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (hasInterestedParties.getInterestedParties as jest.Mock).mockReturnValue(["otherUser"]);

            const decoratedMethod = OnlyContractParty(hasInterestedParties)(mockMethod, {});

            await expect(decoratedMethod("entityId")).rejects.toThrow("Access denied: your company is not an interested party");
        });

        it("throws an error if entity ID is not provided", async () => {
            const decoratedMethod = OnlyContractParty(hasInterestedParties)(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow("Entity ID is required");
        });
    });

    describe("OnlySupplier", () => {
        it("calls the original method if the user is the supplier", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (hasSupplier.getSupplier as jest.Mock).mockReturnValue("testUser");

            const decoratedMethod = OnlySupplier(hasSupplier)(mockMethod, {});
            await decoratedMethod("entityId");

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws an error if the user is not the supplier", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (hasSupplier.getSupplier as jest.Mock).mockReturnValue("otherUser");

            const decoratedMethod = OnlySupplier(hasSupplier)(mockMethod, {});

            await expect(decoratedMethod("entityId")).rejects.toThrow("Access denied: your company is not the supplier");
        });

        it("throws an error if entity ID is not provided", async () => {
            const decoratedMethod = OnlySupplier(hasSupplier)(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow("Entity ID is required");
        });
    });

    describe("OnlyCommissioner", () => {
        it("calls the original method if the user is the commissioner", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (hasCommissioner.getCommissioner as jest.Mock).mockReturnValue("testUser");

            const decoratedMethod = OnlyCommissioner(hasCommissioner)(mockMethod, {});
            await decoratedMethod("entityId");

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws an error if the user is not the commissioner", async () => {
            (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue("testUser");
            (hasCommissioner.getCommissioner as jest.Mock).mockReturnValue("otherUser");

            const decoratedMethod = OnlyCommissioner(hasCommissioner)(mockMethod, {});
            await expect(decoratedMethod("entityId")).rejects.toThrow("Access denied: your company is not the commissioner");

            expect(mockMethod).not.toHaveBeenCalled();
        });

        it("throws an error if entity ID is not provided", async () => {
            const decoratedMethod = OnlyCommissioner(hasCommissioner)(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow("Entity ID is required");
        });
    });
});
