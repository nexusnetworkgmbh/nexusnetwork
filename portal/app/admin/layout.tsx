import Link from 'next/link';
import {admin} from '@/lib/access';
import {Brand} from '@/components/ui';
import {logout} from '@/lib/actions';
export default async function AdminLayout({children}:{children:React.ReactNode}){await admin();return <main id="content" className="admin-layout"><div className="inline"><Brand/><nav aria-label="Administration"><Link href="/admin">Partnerprüfung</Link><Link href="/portal">Zum Portal</Link></nav><form action={logout}><button>Abmelden</button></form></div>{children}</main>;}
