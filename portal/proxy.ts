import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request:NextRequest) {
  let response=NextResponse.next({request});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const protectedRoute=['/portal','/admin','/onboarding','/reset-password'].some(path=>request.nextUrl.pathname===path||request.nextUrl.pathname.startsWith(path+'/'));
  let authenticated=false;
  if(url&&key) {
    const db=createServerClient(url,key,{cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')},cookies:{
      getAll:()=>request.cookies.getAll(),
      setAll(values,headers){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));if(headers) Object.entries(headers).forEach(([key,value])=>response.headers.set(key,value));},
    }});
    const {data,error}=await db.auth.getClaims();
    authenticated=!error&&Boolean(data?.claims?.sub);
  }
  if(protectedRoute&&!authenticated){
    const destination=request.nextUrl.clone();destination.pathname='/login';destination.search=url&&key?'':'?notice=setup';
    const denied=NextResponse.redirect(destination);
    response.cookies.getAll().forEach(cookie=>denied.cookies.set(cookie));
    denied.headers.set('Cache-Control','private, no-store');
    return denied;
  }
  response.headers.set('Cache-Control','private, no-store');
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)']};
