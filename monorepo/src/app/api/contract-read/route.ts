import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';

const client = createPublicClient({
  chain: celo,
  transport: http()
});

export async function POST(req: NextRequest) {
  try {
    const { address, abi, functionName, args = [] } = await req.json();

    if (!address || !abi || !functionName) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, abi, functionName' },
        { status: 400 }
      );
    }

    const result = await client.readContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Contract read error:', error);
    return NextResponse.json(
      { error: 'Failed to read from contract', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
