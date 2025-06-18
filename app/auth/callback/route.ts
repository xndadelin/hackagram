import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/app`);
    
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/error?message=1`);
}