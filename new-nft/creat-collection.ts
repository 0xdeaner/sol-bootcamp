import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';

import {
    airdropIfRequired, 
    getExplorerLink,
    getKeypairFromFile
} from '@solana-developers/helpers';

import {
    generateSigner,
    keypairIdentity,
    percentAmount,
  } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import {
    clusterApiUrl,
    Connection, 
    LAMPORTS_PER_SOL, 
    PublicKey, 
    Transaction
} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const user = await getKeypairFromFile('~/.config/solana/id.json');

await airdropIfRequired(
    connection, 
    user.publicKey, 
    2 * LAMPORTS_PER_SOL, 
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user account:", user.publicKey.toBase58());
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi Instance for User");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "Super Cool Collection",
    symbol: "SCC",
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0.0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollection = await fetchDigitalAsset(umi, collectionMint.publicKey);
console.log(
    `Created Collection 📦! Address is ${getExplorerLink(
      "address",
      createdCollection.mint.publicKey,
      "devnet"
    )}`
  );