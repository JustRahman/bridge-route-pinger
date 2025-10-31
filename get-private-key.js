import { ethers } from 'ethers';

const mnemonic = "eager tobacco flush adapt bench guitar only business limit dose enemy engine";
const wallet = ethers.Wallet.fromPhrase(mnemonic);

console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);