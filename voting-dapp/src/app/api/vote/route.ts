import { ACTIONS_CORS_HEADERS , ActionGetResponse, ActionPostRequest, createPostResponse} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {Voting} from "@/../anchor/target/types/voting"
import { BN, Program } from "@coral-xyz/anchor";

import IDL from '@/../anchor/target/idl/voting.json';

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon:"https://hips.hearstapps.com/hmg-prod/images/peanut-butter-vegan-1556206811.jpg?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*", 
    title: "Vote For Your Favorite Type of Peanut Butter",
    description: "Vote between crunchy and smooth peanut butter",
    label: "Vote", 
    links: {
      actions: [
        //@ts-ignore
            {
              label: "Crunchy",
              href: "/api/vote?candidate=Crunchy",
            },
            //@ts-ignore
            {
              label: "Smooth",
              href: "/api/vote?candidate=Smooth",
            }
      ]
    }
  }
  return Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS})
}

export async function POST(request: Request) {
  
  const url = new URL(request.url)
  const candidate = url.searchParams.get("candidate")
  
  if (candidate !== "Crunchy" && candidate !== "Smooth") {
    return Response.json({error: "Invalid candidate"}, {status: 400, headers: ACTIONS_CORS_HEADERS})
  }
  
  const connection = new Connection("http://127.0.0.1:8899", "confirmed")
  const program: Program<Voting> = new Program(IDL as Voting, {connection})

  const body: ActionPostRequest = await request.json()
  let voter

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    return new Response("Invalid account", {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter
    })
    .instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction()
    .add(instruction)

  transaction.recentBlockhash = blockhash.blockhash
  transaction.feePayer = voter

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
    }
  } as any)

  return Response.json(response,{headers: ACTIONS_CORS_HEADERS})
}

