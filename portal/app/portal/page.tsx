'use client';
import {browserPage} from '@/components/browser-page';
import Link from '@/components/link';
import {tenant} from '@/lib/access';
import {today,money,type Task,type Deal} from '@/lib/domain';
import {Heading,TaskList,DealList} from '@/components/ui';
async function load(){
 const {db,profile,organizationId,user}=await tenant();const day=today();
 const results=await Promise.all([
 db.from('customers').select('id',{count:'exact',head:true}).eq('organization_id',organizationId),
 db.from('deals').select('id',{count:'exact',head:true}).eq('organization_id',organizationId).not('status','in','(completed,rejected,cancelled)'),
 db.from('tasks').select('id',{count:'exact',head:true}).eq('organization_id',organizationId).in('status',['open','in_progress']),
 db.from('tasks').select('id',{count:'exact',head:true}).eq('organization_id',organizationId).in('status',['open','in_progress']).lt('due_date',day),
 db.from('tasks').select('*').eq('organization_id',organizationId).eq('assigned_to',user.id).in('status',['open','in_progress']).order('due_date').limit(5),
 db.from('deals').select('*').eq('organization_id',organizationId).order('created_at',{ascending:false}).limit(5),
 db.rpc('deal_volume',{org:organizationId}),
 ]);if(results.some(r=>r.error))throw new Error('Übersicht konnte nicht geladen werden.');
 const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Europe/Berlin'}).format(new Date()));
 return <><Heading eyebrow="IHR ARBEITSCOCKPIT" title={`${hour<11?'Guten Morgen':hour<18?'Guten Tag':'Guten Abend'}, ${profile.first_name||'willkommen'}.`} description="Ihre Verbindungen und nächsten Schritte auf einen Blick."/><section className="metrics" aria-label="Kennzahlen">{[['Offene Vermittlungen',results[1].count],['Offene Aufgaben',results[2].count],['Überfällige Aufgaben',results[3].count],['Kunden',results[0].count],['Vermittlungsvolumen',money(Number(results[6].data??0))]].map(([label,value])=><article key={label} className="metric"><span>{label}</span><strong>{value}</strong>{label==='Vermittlungsvolumen'&&<small>Alle nicht stornierten / abgelehnten Vorgänge</small>}</article>)}</section><div className="dashboard-grid"><section className="panel"><div className="inline"><h2>Meine nächsten Aufgaben</h2><Link href="/portal/tasks">Alle Aufgaben →</Link></div><TaskList tasks={results[4].data as Task[]}/></section><section className="panel"><div className="inline"><h2>Letzte Vermittlungen</h2><Link href="/portal/deals">Alle Vorgänge →</Link></div><DealList deals={results[5].data as Deal[]}/></section></div><section className="panel"><p className="eyebrow">SCHNELLZUGRIFF</p><div className="quick-actions"><Link href="/portal/customers/new">+ Kunde anlegen</Link><Link href="/portal/deals/new">+ Vermittlung anlegen</Link><Link href="/portal/tasks/new">+ Aufgabe erstellen</Link></div></section></>;
}
export default browserPage(load);
