'use client';
import {browserPage} from '@/components/browser-page';
import {AuthPage} from '@/components/auth-page';
async function load({searchParams}:{params:Promise<Record<string,string>>;searchParams:Promise<Record<string,string>>}){return <AuthPage mode="login" notice={(await searchParams).notice}/>;}
export default browserPage(load);
