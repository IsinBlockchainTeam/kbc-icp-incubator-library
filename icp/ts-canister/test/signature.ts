import {keccak256, toUtf8Bytes, verifyMessage, Wallet} from "ethers";

const createSignature = async () => {
    const wallet = new Wallet('538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02');

    const membershipProof = {
        delegatorAddress: "0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123",
        delegatorCredentialIdHash: "0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b",
        delegatorCredentialExpiryDate: 1859262399000
    }
    const membershipSignature = await wallet.signMessage(JSON.stringify(membershipProof));
    console.log('Membership Signature:', membershipSignature);

    const roleProof = {
        delegateAddress: "0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123",
        role: "Viewer",
        delegateCredentialIdHash: "0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4",
        delegateCredentialExpiryDate: 1827353873000
    }
    const roleSignature = await wallet.signMessage(JSON.stringify(roleProof));
    console.log('Role Signature:', roleSignature);

    verifySignature();
}

const verifySignature = async () => {
    const data = {
        delegateAddress: "0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123",
        role: "Viewer",
        delegateCredentialIdHash: "0x86038e5da6237d8a8faa081c74a958bbc8f319e14c350cee187acb0f898d97c5",
        delegateCredentialExpiryDate: 123,
    }
    const signature = '0xd44c37c07a642b4efed20631c48479c86d0fac183ec7d8f61928e09974b8dc682edbc03bd64d065790e74df9977741dcc2aeed1d2281f4a30d7f5d99dc747e691b';
    const stringifiedData = JSON.stringify(data);

    console.log(verifyMessage(stringifiedData, signature));
}

createSignature();
// 0x518dfb3ac070b6649de316086e2a6338328895990a7d8ebb6bf0c32870b2c8aa6f6046ce805d8ebd4e487aa85c26ba875e600ce4b2b7c54068b41a4a8de7fd5b1c
