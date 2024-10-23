import { createActor } from 'icp-declarations/entity_manager';
import type {Identity} from "@dfinity/agent";
import {RoleProof} from "@kbc-lib/azle-types";
import {MaterialDriver} from "../MaterialDriver";
import {EntityBuilder} from "../../../utils/icp/EntityBuilder";
import {Material} from "../../../entities/Material";

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../../utils/icp/EntityBuilder');

describe('MaterialDriver', () => {
    let materialDriver: MaterialDriver;
    const mockFn = {
        getMaterials: jest.fn(),
        getMaterial: jest.fn(),
        createMaterial: jest.fn(),
        updateMaterial: jest.fn()
    }
    const defaultMaterial = {id: 0} as Material;

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getMaterials: mockFn.getMaterials,
            getMaterial: mockFn.getMaterial,
            createMaterial: mockFn.createMaterial,
            updateMaterial: mockFn.updateMaterial
        });
        jest.spyOn(EntityBuilder, 'buildMaterial').mockReturnValue(defaultMaterial);
        const icpIdentity = {} as Identity;
        materialDriver = new MaterialDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve product categories', async () => {
        const roleProof = {} as RoleProof;
        const rawMaterial = {name: 'test'};
        mockFn.getMaterials.mockReturnValue([rawMaterial]);
        await expect(materialDriver.getMaterials(roleProof)).resolves.toEqual([defaultMaterial]);
        expect(mockFn.getMaterials).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalledWith(rawMaterial);
    });

    it('should retrieve a product category', async () => {
        const roleProof = {} as RoleProof;
        const rawMaterial = {name: 'test'};
        mockFn.getMaterial.mockReturnValue(rawMaterial);
        await expect(materialDriver.getMaterial(roleProof, 1)).resolves.toEqual(defaultMaterial);
        expect(mockFn.getMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalledWith(rawMaterial);
    });

    it('should create a product category', async () => {
        const roleProof = {} as RoleProof;
        const rawMaterial = {name: 'test'};
        mockFn.createMaterial.mockReturnValue(rawMaterial);
        await expect(materialDriver.createMaterial(roleProof, 1)).resolves.toEqual(defaultMaterial);
        expect(mockFn.createMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalledWith(rawMaterial);
    });

    it('should update a product category', async () => {
        const roleProof = {} as RoleProof;
        const rawMaterial = {name: 'test'};
        mockFn.updateMaterial.mockReturnValue(rawMaterial);
        await expect(materialDriver.updateMaterial(roleProof, 1, 1)).resolves.toEqual(defaultMaterial);
        expect(mockFn.updateMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalled();
        expect(EntityBuilder.buildMaterial).toHaveBeenCalledWith(rawMaterial);
    });
});
