import {keccak256, toUtf8Bytes, verifyMessage, Wallet} from "ethers";

const createSignature = async () => {
    const proof = {
        delegateAddress: "0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123",
        role: "Viewer",
        delegateCredentialIdHash: "0x86038e5da6237d8a8faa081c74a958bbc8f319e14c350cee187acb0f898d97c5",
        delegateCredentialExpiryDate: 1827353873000
    }
    const wallet = new Wallet('538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02');
    const signature = await wallet.signMessage(JSON.stringify(proof));

    console.log(signature);
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
// 0xd44c37c07a642b4efed20631c48479c86d0fac183ec7d8f61928e09974b8dc682edbc03bd64d065790e74df9977741dcc2aeed1d2281f4a30d7f5d99dc747e691b
