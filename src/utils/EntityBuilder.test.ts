import { BigNumber } from 'ethers';
import { Material } from '../entities/Material';
import { EntityBuilder } from './EntityBuilder';
import {
    DocumentManager,
    RelationshipManager,
    MaterialManager,
    OfferManager,
    ProductCategoryManager,
    AssetOperationManager
} from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Offer } from '../entities/Offer';
import { ProductCategory } from '../entities/ProductCategory';
import { AssetOperation } from '../entities/AssetOperation';

describe('EntityBuilder', () => {
    describe('buildProductCategory', () => {
        it('should correctly build a product category', () => {
            const bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput = [
                BigNumber.from(0),
                'product category',
                1,
                'description',
                true
            ] as ProductCategoryManager.ProductCategoryStructOutput;
            bcProductCategory.id = BigNumber.from(0);
            bcProductCategory.name = 'product category';
            bcProductCategory.quality = 1;
            bcProductCategory.description = 'description';

            expect(EntityBuilder.buildProductCategory(bcProductCategory)).toEqual(
                new ProductCategory(0, 'product category', 1, 'description')
            );
        });
    });

    describe('buildMaterial', () => {
        const bcMaterial: MaterialManager.MaterialStructOutput = [
            BigNumber.from(0),
            BigNumber.from(1),
            true
        ] as MaterialManager.MaterialStructOutput;
        const bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput = [
            BigNumber.from(1),
            'product category',
            1,
            'description',
            true
        ] as ProductCategoryManager.ProductCategoryStructOutput;
        bcMaterial.id = BigNumber.from(0);
        bcMaterial.productCategoryId = BigNumber.from(1);
        bcMaterial.exists = true;
        bcProductCategory.id = BigNumber.from(1);
        bcProductCategory.name = 'product category';
        bcProductCategory.quality = 1;
        bcProductCategory.description = 'description';
        bcProductCategory.exists = true;

        it('should correctly build a material', () => {
            expect(EntityBuilder.buildMaterial(bcMaterial, bcProductCategory)).toEqual(
                new Material(0, new ProductCategory(1, 'product category', 1, 'description'))
            );
        });

        it('should correctly build a material - FAIL(Product category id of material and product category must be equal)', () => {
            bcMaterial.productCategoryId = BigNumber.from(2);

            expect(() => EntityBuilder.buildMaterial(bcMaterial, bcProductCategory)).toThrow(
                'Product category id of material and product category must be equal'
            );
        });
    });

    describe('buildTransformation', () => {
        const bcMaterial: MaterialManager.MaterialStructOutput = [
            BigNumber.from(0),
            BigNumber.from(1),
            true
        ] as MaterialManager.MaterialStructOutput;
        const bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput = [
            BigNumber.from(1),
            'product category',
            1,
            'description',
            true
        ] as ProductCategoryManager.ProductCategoryStructOutput;
        bcMaterial.id = BigNumber.from(0);
        bcMaterial.productCategoryId = BigNumber.from(1);
        bcMaterial.exists = true;
        bcProductCategory.id = BigNumber.from(1);
        bcProductCategory.name = 'product category';
        bcProductCategory.quality = 1;
        bcProductCategory.description = 'description';
        bcProductCategory.exists = true;

        it('should correctly build a transformation', () => {
            const bcTransformation: AssetOperationManager.AssetOperationStructOutput = [
                BigNumber.from(0),
                'transformation',
                [BigNumber.from(0)],
                BigNumber.from(3),
                '46.003677',
                '8.953062',
                ['process type 1'],
                true
            ] as AssetOperationManager.AssetOperationStructOutput;
            bcTransformation.id = BigNumber.from(0);
            bcTransformation.name = 'transformation';
            bcTransformation.inputMaterialIds = [BigNumber.from(0)];
            bcTransformation.outputMaterialId = BigNumber.from(3);
            bcTransformation.latitude = '46.003677';
            bcTransformation.longitude = '8.953062';
            bcTransformation.processTypes = ['process type 1'];
            bcTransformation.exists = true;

            expect(
                EntityBuilder.buildAssetOperation(
                    bcTransformation,
                    [bcMaterial],
                    [bcProductCategory],
                    bcMaterial,
                    bcProductCategory
                )
            ).toEqual(
                new AssetOperation(
                    0,
                    'transformation',
                    [new Material(0, new ProductCategory(1, 'product category', 1, 'description'))],
                    new Material(0, new ProductCategory(1, 'product category', 1, 'description')),
                    '46.003677',
                    '8.953062',
                    ['process type 1']
                )
            );
        });
    });

    describe('buildRelationship', () => {
        it('should correctly build a relationship', () => {
            const bcRelationship: RelationshipManager.RelationshipStructOutput = [
                BigNumber.from(0),
                'companyA_address',
                'companyB_address',
                BigNumber.from(1692001147),
                BigNumber.from(0),
                true
            ] as RelationshipManager.RelationshipStructOutput;
            bcRelationship.id = BigNumber.from(0);
            bcRelationship.companyA = 'companyA';
            bcRelationship.companyB = 'companyB';
            bcRelationship.validFrom = BigNumber.from(1692001147);
            bcRelationship.validUntil = BigNumber.from(0);
            bcRelationship.exists = true;

            const relationship = new Relationship(
                0,
                'companyA',
                'companyB',
                new Date(1692001147),
                new Date(0)
            );
            expect(EntityBuilder.buildRelationship(bcRelationship)).toEqual(relationship);
            expect(relationship.validUntil).toBeUndefined();
        });
    });

    describe('buildDocument', () => {
        it('should correctly build a document', () => {
            const bcDocument: DocumentManager.DocumentStructOutput = [
                BigNumber.from(0),
                'external url',
                'content_hash',
                '0xuploader',
                true
            ] as DocumentManager.DocumentStructOutput;
            bcDocument.id = BigNumber.from(0);
            bcDocument.externalUrl = 'external url';
            bcDocument.contentHash = 'content_hash';
            bcDocument.exists = true;

            const document = new DocumentInfo(0, 'external url', 'content_hash', '0xuploader');
            expect(EntityBuilder.buildDocumentInfo(bcDocument)).toEqual(document);
        });
    });

    describe('buildOffer', () => {
        it('should correctly build an offer', () => {
            const bcOffer: OfferManager.OfferStructOutput = [
                BigNumber.from(0),
                'owner',
                BigNumber.from(1),
                true
            ] as OfferManager.OfferStructOutput;
            bcOffer.id = BigNumber.from(0);
            bcOffer.owner = 'owner';
            bcOffer.productCategoryId = BigNumber.from(1);
            bcOffer.exists = true;
            const bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput = {
                id: BigNumber.from(0),
                name: 'test product',
                quality: 1,
                description: 'description',
                exists: true
            } as ProductCategoryManager.ProductCategoryStructOutput;
            const offer: Offer = new Offer(
                0,
                'owner',
                EntityBuilder.buildProductCategory(bcProductCategory)
            );

            expect(EntityBuilder.buildOffer(bcOffer, bcProductCategory)).toStrictEqual(offer);
        });
    });

    // describe('buildTradeLine', () => {
    //     it('should correctly build a trade line', () => {
    //         const bcLine: Trade.LineStructOutput = {
    //             id: BigNumber.from(1),
    //             productCategoryId: BigNumber.from(2),
    //             materialId: BigNumber.from(3),
    //             exists: true,
    //         } as Trade.LineStructOutput;
    //         const line: Line = new Line(1, new Material(3, new ProductCategory(2, 'product category', 1, 'description')), new ProductCategory(2, 'product category', 1, 'description')));
    //         expect(EntityBuilder.buildTradeLine(bcLine)).toStrictEqual(line);
    //     });
    // });
});
