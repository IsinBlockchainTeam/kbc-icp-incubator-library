import { IDL, query, update, StableBTreeMap } from 'azle';

class ElementRegistry {
    elements = StableBTreeMap<bigint, string>(0);

    @query([], IDL.Vec(IDL.Text))
    getElements(): string[] {
        return this.elements.values();
    }

    @query([IDL.Nat], IDL.Opt(IDL.Text))
    getElement(id: bigint): [string] | [] {
        const result = this.elements.get(id);
        return result ? [result] : [];
    }

    @update([IDL.Text], IDL.Nat)
    addElement(element: string): bigint {
        if (this.hasElement(element)) {
            throw new Error('Element already exists');
        }
        const id = this.elements.keys().length;
        this.elements.insert(BigInt(id), element);
        return BigInt(id);
    }

    @update([IDL.Nat, IDL.Text], IDL.Nat)
    updateElement(id: bigint, element: string): bigint {
        if (!this.elements.get(id)) {
            throw new Error('Element not found');
        }
        this.elements.insert(id, element);
        return id;
    }

    @query([IDL.Text], IDL.Bool)
    hasElement(element: string): boolean {
        return this.elements.values().includes(element);
    }
}
export default ElementRegistry;
