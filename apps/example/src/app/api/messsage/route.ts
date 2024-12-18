import { NextRequest, NextResponse } from "next/server";

export interface Message {
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Message;
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const message: Message = {
    message: "Hello World",
  };
  return NextResponse.json(message);
}
