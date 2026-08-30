import {tenant} from '@/lib/access';
import {saveRecord} from '@/lib/actions';
import {sections,type Section} from '@/lib/fields';
import {ActionForm} from './action-form';
import {FieldInput} from './ui';
export async function RecordForm({section,id=null,values={}}:{section:Section;id?:string|null;values?:Record<string,string|number|null>}){
 const {db,user,organizationId}=await tenant();
 // Fetch only relation options, in bounded pages to avoid silent PostgREST truncation.
 async function allOptions(table:'customers'|'deals'|'organization_members'){
   const rows:Record<string,string>[]=[];let offset=0;
   while(true){const {data,error}=await db.from(table).select(table==='customers'?'id,first_name,last_name':table==='deals'?'id,title,deal_number':'user_id').eq('organization_id',organizationId).order(table==='organization_members'?'user_id':'id').range(offset,offset+499);if(error)throw new Error('Verknüpfungen konnten nicht geladen werden.');rows.push(...data as unknown as Record<string,string>[]);if(data.length<500)break;offset+=500;}
   return rows;
 }
 const [customers,deals,members]=await Promise.all([section!=='customers'?allOptions('customers'):[],section==='tasks'?allOptions('deals'):[],section==='tasks'?allOptions('organization_members'):[]]);
 const memberIds=members.map(m=>m.user_id);const profiles=memberIds.length?await db.from('profiles').select('user_id,first_name,last_name').in('user_id',memberIds):{data:[],error:null};if(profiles.error)throw new Error('Team konnte nicht geladen werden.');
 const options={customer:customers.map(c=>({id:c.id,label:`${c.first_name} ${c.last_name}`})),deal:deals.map(d=>({id:d.id,label:`${d.deal_number} · ${d.title}`})),member:(profiles.data??[]).map(p=>({id:p.user_id,label:`${p.first_name} ${p.last_name}`}))};
 const defaults:Record<string,string|number|null>=section==='tasks'?{status:'open',priority:'normal',assigned_to:user.id,...values}:section==='deals'?{status:'draft',...values}:values;
 return <ActionForm action={saveRecord.bind(null,section,id)} label={`${sections[section].singular} speichern`}><div className="form-grid">{sections[section].fields.map(field=><FieldInput key={field.name} field={field} value={defaults[field.name]} choices={options[field.type as keyof typeof options]}/>)}</div><p className="muted">* Pflichtfelder. Alle Daten bleiben Ihrer Organisation zugeordnet.</p></ActionForm>;
}
