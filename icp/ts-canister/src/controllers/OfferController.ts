import {IDL, query, update} from "azle";
import {IDLOffer} from "../models/idls";
import {Offer} from "../models/types";
import {AtLeastEditor, AtLeastViewer} from "../decorators/roles";
import OfferService from "../services/OfferService";

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
    async createOffer(productCategoryId: bigint): Promise<Offer> {
        return OfferService.instance.createOffer(productCategoryId);
    }
}
export default OfferController;
