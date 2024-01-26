import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import { OfferDriver } from '../drivers/OfferDriver';
import { OfferService } from '../services/OfferService';
import {
    NETWORK,
    OFFER_MANAGER_CONTRACT_ADDRESS,
    PRODUCT_CATEGORY_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY
} from './config';
import {ProductCategoryService} from "../services/ProductCategoryService";
import {ProductCategoryDriver} from "../drivers/ProductCategoryDriver";
import {ProductCategory} from "../entities/ProductCategory";

dotenv.config();

describe('Offer lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let offerDriver: OfferDriver;
    let offerService: OfferService;

    let productCategoryService: ProductCategoryService;

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        signer = new ethers.Wallet(SUPPLIER_PRIVATE_KEY, provider);

        offerDriver = new OfferDriver(
            signer,
            OFFER_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS,
        );
        offerService = new OfferService(offerDriver);
        productCategoryService = new ProductCategoryService(new ProductCategoryDriver(signer, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
    });

    it('Should register some offers', async () => {
        await productCategoryService.registerProductCategory('Coffee Arabica', 85, 'very good coffee');
        await productCategoryService.registerProductCategory('Coffee Nordic', 90, 'even better coffee');
        await offerService.registerOffer(SUPPLIER_ADDRESS, 1);
        await offerService.registerOffer(SUPPLIER_ADDRESS, 2);

        const offerIds = await offerService.getOfferIdsByCompany(SUPPLIER_ADDRESS);
        expect(offerIds.length).toEqual(2);

        const offers = await offerService.getAllOffers();
        expect(offers.length).toEqual(2);

        const offersByCompany = await offerService.getOffersByCompany(SUPPLIER_ADDRESS);
        expect(offersByCompany.length).toEqual(2);

        const offer1 = await offerService.getOffer(offerIds[0]);
        expect(offer1.owner).toEqual(SUPPLIER_ADDRESS);
        expect(offer1.productCategory).toEqual(new ProductCategory(1, 'Coffee Arabica', 85, 'very good coffee'));

        const offer2 = await offerService.getOffer(offerIds[1]);
        expect(offer2.owner).toEqual(SUPPLIER_ADDRESS);
        expect(offer2.productCategory).toEqual(new ProductCategory(2, 'Coffee Nordic', 90, 'even better coffee'));
    });

    it('Should update an offer', async () => {
        const offerIds = await offerService.getOfferIdsByCompany(SUPPLIER_ADDRESS);
        expect(offerIds.length).toBeGreaterThan(0);

        const offer = await offerService.getOffer(offerIds[0]);
        expect(offer.productCategory).toEqual(new ProductCategory(1, 'Coffee Arabica', 85, 'very good coffee'));

        await offerService.updateOffer(offerIds[0], 2);
        const updatedOffer = await offerService.getOffer(offerIds[0]);
        expect(updatedOffer.productCategory).toEqual(new ProductCategory(2, 'Coffee Nordic', 90, 'even better coffee'));
    });

    it('Should delete the first offer', async () => {
        let offerIds = await offerService.getOfferIdsByCompany(SUPPLIER_ADDRESS);
        expect(offerIds.length).toEqual(2);

        const offer = await offerService.getOffer(offerIds[0]);
        expect(offer).toBeDefined();

        await offerService.deleteOffer(offerIds[0]);
        await expect(() => offerService.getOffer(offerIds[0]))
            .rejects.toThrowError(/Offer does not exist/);

        offerIds = await offerService.getOfferIdsByCompany(SUPPLIER_ADDRESS);
        expect(offerIds.length).toEqual(1);
    });
});
