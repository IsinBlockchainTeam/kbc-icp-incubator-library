import {Wallet} from "ethers";
import {OrderManagerDriver} from "./OrderManagerDriver";
import {SiweIdentityProvider} from "./SiweIdentityProvider";
import {computeRoleProof} from "./proof";
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const DELEGATE_CREDENTIAL_ID_HASH = '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH = '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'br5f7-7uaaa-aaaaa-qaaca-cai';
const ORDER_MANAGER_CANISTER_ID = 'by6od-j4aaa-aaaaa-qaadq-cai';
type Utils = {
    userWallet: Wallet,
    companyWallet: Wallet,
    orderManagerDriver: OrderManagerDriver,
    roleProof: RoleProof
};
describe('OrderManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const orderManagerDriver = new OrderManagerDriver(
            siweIdentityProvider.identity, ORDER_MANAGER_CANISTER_ID, 'http://127.0.0.1:4943/'
        );
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyPrivateKey
        );
        return {userWallet, companyWallet, orderManagerDriver, roleProof};
    }

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    }, 30000);

    it('should retrieve orders', async () => {
        const {orderManagerDriver, roleProof} = utils1;
        const orders = await orderManagerDriver.getOrders(roleProof);
        console.log(orders);
        expect(orders).toBeDefined();
    }, 30000);

    it('should retrieve order', async () => {
        const {orderManagerDriver, roleProof} = utils1;
        const order = await orderManagerDriver.getOrder(roleProof, 0);
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should create order', async () => {
        const {companyWallet: company1Wallet, orderManagerDriver, roleProof} = utils1;
        const {companyWallet: company2Wallet} = utils2;
        const date = new Date();
        const orderParams = {
            supplier: company1Wallet.address,
            customer: company2Wallet.address,
            commissioner: company1Wallet.address,
            paymentDeadline: date,
            documentDeliveryDeadline: date,
            shippingDeadline: date,
            deliveryDeadline: date,
            arbiter: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            token: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            agreedAmount: 100,
            escrowManager: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shippingPort',
            deliveryPort: 'deliveryPort',
            lines: [
                {
                    productCategoryId: 1,
                    quantity: 1,
                    unit: 'unit',
                    price: {
                        amount: 1,
                        fiat: 'USD'

                    }
                }
            ]
        }
        const order = await orderManagerDriver.createOrder(
            roleProof,
            orderParams
        );
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should update order', async () => {
        const {companyWallet: company1Wallet, orderManagerDriver, roleProof} = utils1;
        const {companyWallet: company2Wallet} = utils2;
        const date = new Date();
        const orderParams = {
            supplier: company1Wallet.address,
            customer: company2Wallet.address,
            commissioner: company1Wallet.address,
            paymentDeadline: date,
            documentDeliveryDeadline: date,
            shippingDeadline: date,
            deliveryDeadline: date,
            arbiter: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            token: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            agreedAmount: 100,
            escrowManager: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shippingPort',
            deliveryPort: 'deliveryPort',
            lines: [
                {
                    productCategoryId: 1,
                    quantity: 1,
                    unit: 'unit',
                    price: {
                        amount: 1,
                        fiat: 'USD'

                    }
                }
            ]
        }
        date.setDate(date.getDate() + 14);
        const order = await orderManagerDriver.updateOrder(
            roleProof,
            2,
            orderParams
        );
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should sign order', async () => {
        const {orderManagerDriver, roleProof} = utils2;
        const order = await orderManagerDriver.signOrder(roleProof, 0);
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);
});
