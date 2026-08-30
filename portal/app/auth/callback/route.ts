import { NextRequest,NextResponse } from 'next/server';
import { supabase,appUrl,configured } from '@/lib/supabase';
import { safeNext } from '@/lib/validation';
export async function GET(request:NextRequest){
  if(!configured()) return NextResponse.redirect(new URL('/login?notice=setup',request.url));
  const code=request.nextUrl.searchParams.get('code');
  const token_hash=request.nextUrl.searchParams.get('token_hash');
  const type=request.nextUrl.searchParams.get('type');
  const next=safeNext(request.nextUrl.searchParams.get('next'));
  const db=await supabase();
  const result=code?await db.auth.exchangeCodeForSession(code):token_hash && ['signup','recovery','email_change'].includes(type??'')?await db.auth.verifyOtp({token_hash,type:type as 'signup'|'recovery'|'email_change'}):null;
  if(result && !result.error) return NextResponse.redirect(new URL(type==='recovery'?'/reset-password':next,appUrl()));
  return NextResponse.redirect(new URL('/login?notice=expired',appUrl()));
}
