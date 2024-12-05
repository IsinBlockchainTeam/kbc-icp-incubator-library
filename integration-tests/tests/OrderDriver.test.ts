import { Wallet } from 'ethers';
import { OrderDriver, SiweIdentityProvider, ICPAuthenticationDriver } from '@kbc-lib/coffee-trading-management-lib';
import { createRoleProof } from '../../src/__testUtils__/proof';
import { ICP, USERS } from '@kbc-lib/coffee-trading-management-lib/dist/__shared__/constants/constants';

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
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, ICP.SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new ICPAuthenticationDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );
        const orderManagerDriver = new OrderDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, orderManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USERS.USER1_PRIVATE_KEY, USERS.COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USERS.USER2_PRIVATE_KEY, USERS.COMPANY2_PRIVATE_KEY);
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
            token: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
            agreedAmount: 10,
            downPaymentManager: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
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
            token: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
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
