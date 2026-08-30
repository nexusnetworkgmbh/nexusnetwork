import 'server-only';
import {tenant} from './access';
import {type Section} from './fields';
import {pageNumber,searchTerm} from './validation';
import {today,dealStatuses} from './domain';
export interface ListRow { id:string;first_name?:string;last_name?:string;email?:string|null;phone?:string|null;title?:string;status?:string;deal_number?:string;investment_amount?:number|null;due_date?:string;priority?:string;updated_at:string;deals?:{count:number}[] }
export interface ListState {rows:ListRow[];count:number;page:number;error?:string}
export async function queryRecords(section:Section,input:{q?:string;sort?:string;status?:string;view?:string;page?:string}):Promise<ListState>{
 const {db,organizationId}=await tenant();const page=pageNumber(input.page),q=searchTerm(input.q);
 const allowedSort=section==='customers'?['updated_at','created_at','last_name']:section==='tasks'?['updated_at','created_at','title','due_date']:['updated_at','created_at','title'];
 const sortKey=allowedSort.includes(input.sort??'')?input.sort!:'updated_at';
 let query=db.from(section).select(section==='customers'?'*,deals(count)':'*',{count:'exact'}).eq('organization_id',organizationId);
 if(q)query=section==='customers'?query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`):query.ilike('title',`%${q}%`);
 if(section==='deals'&&dealStatuses.includes(input.status as typeof dealStatuses[number]))query=query.eq('status',input.status!);
 if(section==='tasks'){
 const day=today();const end=new Date(`${day}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+((7-end.getUTCDay())%7));const weekEnd=end.toISOString().slice(0,10);
 if(input.view==='done')query=query.in('status',['completed','cancelled']);
 else {query=query.in('status',['open','in_progress']);if(input.view==='today')query=query.eq('due_date',day);if(input.view==='overdue')query=query.lt('due_date',day);if(input.view==='week')query=query.gte('due_date',day).lte('due_date',weekEnd);if(input.view==='later')query=query.gt('due_date',weekEnd);}
 }
 const {data,error,count}=await query.order(sortKey,{ascending:['title','last_name','due_date'].includes(sortKey)}).order('id').range((page-1)*20,page*20-1);
 if(error)throw new Error('Liste konnte nicht geladen werden.');
 return {rows:data as unknown as ListRow[],count:count??0,page};
}
