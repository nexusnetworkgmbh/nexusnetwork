'use client';
import {browserPage} from '@/components/browser-page';
import Link from '@/components/link';
import {admin} from '@/lib/access';
import {Brand} from '@/components/ui';
import {logout} from '@/lib/actions';
async function load({children}:{children?:React.ReactNode}){await admin();return <main id="content" className="admin-layout"><div className="inline"><Brand/><nav aria-label="Administration"><Link href="/admin">Partnerprüfung</Link><Link href="/portal">Zum Portal</Link></nav><form action={logout}><button>Abmelden</button></form></div>{children}</main>;}
export default browserPage(load);
