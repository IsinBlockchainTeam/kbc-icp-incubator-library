import { IDL, query, update } from "azle";
import { IDLOffer } from "../models/idls";
import { Offer } from "../models/types";
import { AtLeastEditor, AtLeastViewer } from "../decorators/roles";
import OfferService from "../services/OfferService";
import {OnlyContractParty} from "../decorators/parties";

class OfferController {
    @query([], IDL.Vec(IDLOffer))
    @AtLeastViewer
    async getOffers(): Promise<Offer[]> {
        return OfferService.instance.getOffers();
    }

    @query([IDL.Nat], IDLOffer)
    @AtLeastViewer
    async getOffer(id: bigint): Promise<Offer> {
        return OfferService.instance.getOffer(id);
    }

    @update([IDL.Nat], IDLOffer)
    @AtLeastEditor
    async createOffer(materialId: bigint): Promise<Offer> {
        return OfferService.instance.createOffer(materialId);
    }

    @update([IDL.Nat])
    @AtLeastEditor
    @OnlyContractParty(OfferService.instance)
    async deleteOffer(id: bigint): Promise<void> {
        return OfferService.instance.deleteOffer(id);
    }
}
export default OfferController;
