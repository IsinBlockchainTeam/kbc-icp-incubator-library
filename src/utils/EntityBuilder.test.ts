import { BigNumber } from 'ethers';
import { Material } from '../entities/Material';
import { EntityBuilder } from './EntityBuilder';
import { DocumentManager, RelationshipManager, TransformationManager, MaterialManager, Trade } from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { Transformation } from '../entities/Transformation';
import { Line } from '../entities/Trade';

describe('EntityBuilder', () => {
    describe('buildMaterial', () => {
        it('should correctly build a material', () => {
            const bcMaterial: MaterialManager.MaterialStructOutput = [BigNumber.from(0), 'material', 'owner', true] as MaterialManager.MaterialStructOutput;
            bcMaterial.id = BigNumber.from(0);
            bcMaterial.name = 'material';
            bcMaterial.owner = 'owner';
            bcMaterial.exists = true;

            expect(EntityBuilder.buildMaterial(bcMaterial)).toEqual(new Material(0, 'material', 'owner'));
        });
    });

    describe('buildTransformation', () => {
        it('should correctly build a transformation', () => {
            const bcMaterial1: MaterialManager.MaterialStructOutput = [BigNumber.from(0), 'material1', 'owner', true] as MaterialManager.MaterialStructOutput;
            bcMaterial1.id = BigNumber.from(0);
            bcMaterial1.name = 'material1';
            bcMaterial1.owner = 'owner';
            bcMaterial1.exists = true;
            const bcMaterial2: MaterialManager.MaterialStructOutput = [BigNumber.from(0), 'material2', 'owner', true] as MaterialManager.MaterialStructOutput;
            bcMaterial2.id = BigNumber.from(0);
            bcMaterial2.name = 'material2';
            bcMaterial2.owner = 'owner';
            bcMaterial2.exists = true;

            const bcTransformation: TransformationManager.TransformationStructOutput = [BigNumber.from(0), 'transformation', [bcMaterial1, bcMaterial2], BigNumber.from(3), 'owner', true] as TransformationManager.TransformationStructOutput;
            bcTransformation.id = BigNumber.from(0);
            bcTransformation.name = 'transformation';
            bcTransformation.inputMaterials = [bcMaterial1, bcMaterial2];
            bcTransformation.outputMaterialId = BigNumber.from(3);
            bcTransformation.owner = 'owner';

            expect(EntityBuilder.buildTransformation(bcTransformation)).toEqual(new Transformation(0, 'transformation', [EntityBuilder.buildMaterial(bcMaterial1), EntityBuilder.buildMaterial(bcMaterial2)], 3, 'owner'));
        });
    });

    describe('buildRelationship', () => {
        it('should correctly build a relationship', () => {
            const bcRelationship: RelationshipManager.RelationshipStructOutput = [BigNumber.from(0), 'companyA_address', 'companyB_address', BigNumber.from(1692001147), BigNumber.from(0), true] as RelationshipManager.RelationshipStructOutput;
            bcRelationship.id = BigNumber.from(0);
            bcRelationship.companyA = 'companyA';
            bcRelationship.companyB = 'companyB';
            bcRelationship.validFrom = BigNumber.from(1692001147);
            bcRelationship.validUntil = BigNumber.from(0);
            bcRelationship.exists = true;

            const relationship = new Relationship(0, 'companyA', 'companyB', new Date(1692001147), new Date(0));
            expect(EntityBuilder.buildRelationship(bcRelationship)).toEqual(relationship);
            expect(relationship.validUntil).toBeUndefined();
        });
    });

    describe('buildDocument', () => {
        it('should correctly build a document', () => {
            const bcDocument: DocumentManager.DocumentStructOutput = [BigNumber.from(0), BigNumber.from(2), 'doc name', DocumentType.DELIVERY_NOTE, 'external url', true] as DocumentManager.DocumentStructOutput;
            bcDocument.id = BigNumber.from(0);
            bcDocument.transactionId = BigNumber.from(2);
            bcDocument.name = 'doc name';
            bcDocument.documentType = DocumentType.DELIVERY_NOTE;
            bcDocument.externalUrl = 'external url';
            bcDocument.exists = true;

            const document = new DocumentInfo(0, 2, 'doc name', DocumentType.DELIVERY_NOTE, 'external url');
            expect(EntityBuilder.buildDocumentInfo(bcDocument)).toEqual(document);
        });
    });

    describe('buildTradeLine', () => {
        it('should correctly build a trade line', () => {
            const id: number = 0;
            const materialsId: [number, number] = [1, 2];
            const productCategory: string = 'test product';
            const exists: boolean = true;

            const bcLine: Trade.LineStructOutput = {
                id: BigNumber.from(id),
                materialsId:
                    [BigNumber.from(materialsId[0]), BigNumber.from(materialsId[1])],
                productCategory,
                exists,
            } as Trade.LineStructOutput;
            const line: Line = new Line(id, materialsId, productCategory);
            expect(EntityBuilder.buildTradeLine(bcLine)).toStrictEqual(line);
        });
    });
});
