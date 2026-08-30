import {tenant} from './access';
import {type Section} from './fields';
import {pageNumber,searchTerm} from './validation';
export interface ListRow { id:string;first_name?:string;last_name?:string;email?:string|null;phone?:string|null;title?:string;status?:string;deal_number?:string;investment_amount?:number|null;due_date?:string;priority?:string;updated_at:string;deals?:{count:number}[] }
export interface ListState {rows:ListRow[];count:number;page:number;error?:string}
export async function queryRecords(section:Section,input:{q?:string;sort?:string;status?:string;view?:string;page?:string}):Promise<ListState>{
 const {db}=await tenant();
 const {data,error}=await db.rpc('search_records',{section,term:searchTerm(input.q),sort_key:input.sort||'updated_at',filter_status:input.status||'',task_view:input.view||'',page_index:pageNumber(input.page)});
 if(error||!data)throw new Error('Liste konnte nicht geladen werden.');
 return data as ListState;
}
