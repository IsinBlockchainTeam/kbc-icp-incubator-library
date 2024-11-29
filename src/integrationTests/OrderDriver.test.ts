import { Wallet } from 'ethers';
import { OrderDriver } from '../drivers/OrderDriver';
import { SiweIdentityProvider } from '../drivers/SiweIdentityProvider';
import { AuthenticationDriver } from '../drivers/AuthenticationDriver';
import { createRoleProof } from '../__testUtils__/proof';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = 'ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    orderManagerDriver: OrderDriver;
    authenticate: () => Promise<void>;
};
const ORDER_ID = 0;
const PRODUCT_CATEGORY_ID = 0;
describe('OrderDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const orderManagerDriver = new OrderDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, orderManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    }, 30000);

    it('should retrieve orders', async () => {
        const { orderManagerDriver, authenticate } = utils1;
        await authenticate();
        const orders = await orderManagerDriver.getOrders();
        console.log(orders);
        expect(orders).toBeDefined();
    }, 30000);

    it('should retrieve order', async () => {
        const { orderManagerDriver, authenticate } = utils1;
        await authenticate();
        const order = await orderManagerDriver.getOrder(0);
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should create order', async () => {
        const { companyWallet: company1Wallet, orderManagerDriver, authenticate } = utils1;
        await authenticate();
        const { companyWallet: company2Wallet } = utils2;
        const date = new Date();
        const orderParams = {
            supplier: company1Wallet.address,
            customer: company2Wallet.address,
            commissioner: company2Wallet.address,
            paymentDeadline: date,
            documentDeliveryDeadline: date,
            shippingDeadline: date,
            deliveryDeadline: date,
            arbiter: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            token: '0xc5a5C42992dECbae36851359345FE25997F5C42d',
            agreedAmount: 10,
            escrowManager: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shippingPort',
            deliveryPort: 'deliveryPort',
            lines: [
                {
                    productCategoryId: PRODUCT_CATEGORY_ID,
                    quantity: 1,
                    unit: 'unit',
                    price: {
                        amount: 1,
                        fiat: 'USD'
                    }
                }
            ]
        };
        date.setDate(date.getDate() + 14);
        const order = await orderManagerDriver.createOrder(orderParams);
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should retrieve orders', async () => {
        const { orderManagerDriver } = utils1;
        const orders = await orderManagerDriver.getOrders();
        console.log(orders);
        expect(orders).toBeDefined();
        expect(orders.length).toBeGreaterThan(0);
    }, 30000);

    it('should update order', async () => {
        const { companyWallet: company1Wallet, orderManagerDriver, authenticate } = utils1;
        await authenticate();
        const { companyWallet: company2Wallet } = utils2;
        const date = new Date();
        const orderParams = {
            supplier: company1Wallet.address,
            customer: company2Wallet.address,
            commissioner: company2Wallet.address,
            paymentDeadline: date,
            documentDeliveryDeadline: date,
            shippingDeadline: date,
            deliveryDeadline: date,
            arbiter: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            token: '0xc5a5C42992dECbae36851359345FE25997F5C42d',
            agreedAmount: 100,
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shippingPort',
            deliveryPort: 'deliveryPort',
            lines: [
                {
                    productCategoryId: PRODUCT_CATEGORY_ID,
                    quantity: 1,
                    unit: 'unit',
                    price: {
                        amount: 1,
                        fiat: 'USD'
                    }
                }
            ]
        };
        date.setDate(date.getDate() + 14);
        const order = await orderManagerDriver.updateOrder(ORDER_ID, orderParams);
        console.log(order);
        expect(order).toBeDefined();
    }, 30000);

    it('should sign order', async () => {
        const { orderManagerDriver, authenticate } = utils2;
        await authenticate();
        const order = await orderManagerDriver.signOrder(ORDER_ID);
        console.log(order);
        expect(order).toBeDefined();
    }, 60000);
});
