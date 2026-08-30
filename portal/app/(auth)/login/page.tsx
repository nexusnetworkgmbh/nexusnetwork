import {AuthPage} from '@/components/auth-page';
export default async function Page({searchParams}:{searchParams:Promise<{notice?:string}>}){return <AuthPage mode="login" notice={(await searchParams).notice}/>;}
