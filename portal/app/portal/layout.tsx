import Link from 'next/link';
import {activeAccount} from '@/lib/access';
import {isAdmin} from '@/lib/domain';
import {Brand} from '@/components/ui';
import {logout} from '@/lib/actions';
export default async function PortalLayout({children}:{children:React.ReactNode}){
 const {profile}=await activeAccount();
 return <div className="workspace"><aside className="sidebar"><Brand/><p className="eyebrow">ARBEITSBEREICH</p><nav aria-label="Portal"><Link href="/portal">◈ Übersicht</Link><p>GESCHÄFT</p><Link href="/portal/deals">◇ Vermittlungen</Link><Link href="/portal/customers">◎ Kunden</Link><Link href="/portal/tasks">✓ Aufgaben</Link><p>KONTO</p><Link href="/portal/profile">Profil</Link><Link href="/portal/settings">Einstellungen</Link>{isAdmin(profile.role)&&<Link href="/admin">Administration</Link>}</nav><div className="sidebar-bottom"><strong>{profile.first_name} {profile.last_name}</strong><small>Partnerzugang · aktiv</small><form action={logout}><button className="quiet">Abmelden ↗</button></form></div></aside><main id="content" className="workspace-main"><div className="topline"><span>Ihr vernetzter Arbeitsalltag</span><span className="online">Geschützter Bereich</span></div>{children}</main></div>;
}
