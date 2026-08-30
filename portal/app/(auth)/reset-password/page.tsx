import {AuthPage} from '@/components/auth-page';
import {account} from '@/lib/access';
export default async function Page(){await account();return <AuthPage mode="reset-password"/>;}
