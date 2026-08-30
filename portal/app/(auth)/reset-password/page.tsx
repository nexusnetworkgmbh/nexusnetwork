'use client';
import {browserPage} from '@/components/browser-page';
import {AuthPage} from '@/components/auth-page';
import {account} from '@/lib/access';
async function load(){await account();return <AuthPage mode="reset-password"/>;}
export default browserPage(load);
