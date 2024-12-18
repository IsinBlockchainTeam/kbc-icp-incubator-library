import { ic } from "azle/experimental";
import AuthenticationService from "../../services/AuthenticationService";
import { NotAuthenticatedError, NotAuthorizedError } from "../../models/errors";
import { NotControllerError } from "../../models/errors/AuthenticationError";
import { AtLeastViewer, AtLeastEditor, AtLeastSigner, OnlyController } from "../roles";

jest.mock("azle/experimental", () => ({
    ic: {
        caller: jest.fn(),
        isController: jest.fn()
    }
}));

jest.mock("../../services/AuthenticationService", () => ({
    instance: {
        isAuthenticated: jest.fn(),
        isAtLeast: jest.fn()
    }
}));

describe("Role Decorators", () => {
    const mockMethod = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("AtLeastViewer", () => {
        it("calls the original method if the user is authenticated and has at least Viewer role", async () => {
            ((ic.caller as jest.Mock) as jest.Mock).mockReturnValue("testUser");
            ((AuthenticationService.instance.isAuthenticated as jest.Mock) as jest.Mock).mockReturnValue(true);
            ((AuthenticationService.instance.isAtLeast as jest.Mock) as jest.Mock).mockReturnValue(true);

            const decoratedMethod = AtLeastViewer(mockMethod, {});
            await decoratedMethod();

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws NotAuthenticatedError if the user is not authenticated", async () => {
            ((ic.caller as jest.Mock) as jest.Mock).mockReturnValue("testUser");
            ((AuthenticationService.instance.isAuthenticated as jest.Mock) as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastViewer(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthenticatedError);
        });

        it("throws NotAuthorizedError if the user does not have at least Viewer role", async () => {
            ((ic.caller as jest.Mock) as jest.Mock).mockReturnValue("testUser");
            ((AuthenticationService.instance.isAuthenticated as jest.Mock) as jest.Mock).mockReturnValue(true);
            ((AuthenticationService.instance.isAtLeast as jest.Mock) as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastViewer(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthorizedError);
        });
    });

    describe("AtLeastEditor", () => {
        it("calls the original method if the user is authenticated and has at least Editor role", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthenticationService.instance.isAtLeast as jest.Mock).mockReturnValue(true);

            const decoratedMethod = AtLeastEditor(mockMethod, {});
            await decoratedMethod();

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws NotAuthenticatedError if the user is not authenticated", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastEditor(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthenticatedError);
        });

        it("throws NotAuthorizedError if the user does not have at least Editor role", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthenticationService.instance.isAtLeast as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastEditor(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthorizedError);
        });
    });

    describe("AtLeastSigner", () => {
        it("calls the original method if the user is authenticated and has at least Signer role", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthenticationService.instance.isAtLeast as jest.Mock).mockReturnValue(true);

            const decoratedMethod = AtLeastSigner(mockMethod, {});
            await decoratedMethod();

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws NotAuthenticatedError if the user is not authenticated", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastSigner(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthenticatedError);
        });

        it("throws NotAuthorizedError if the user does not have at least Signer role", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (AuthenticationService.instance.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthenticationService.instance.isAtLeast as jest.Mock).mockReturnValue(false);

            const decoratedMethod = AtLeastSigner(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotAuthorizedError);
        });
    });

    describe("OnlyController", () => {
        it("calls the original method if the user is a controller", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (ic.isController as jest.Mock).mockReturnValue(true);

            const decoratedMethod = OnlyController(mockMethod, {});
            await decoratedMethod();

            expect(mockMethod).toHaveBeenCalled();
        });

        it("throws NotControllerError if the user is not a controller", async () => {
            (ic.caller as jest.Mock).mockReturnValue("testUser");
            (ic.isController as jest.Mock).mockReturnValue(false);

            const decoratedMethod = OnlyController(mockMethod, {});

            await expect(decoratedMethod()).rejects.toThrow(NotControllerError);
        });
    });
});
