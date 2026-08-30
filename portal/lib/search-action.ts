'use server';
import {queryRecords,type ListState} from './list-query';
import {isSection,type Section} from './fields';
import {text} from './validation';
import {tenant} from './access';
export async function searchRecords(section:Section,_previous:ListState,data:FormData):Promise<ListState>{
 // The query travels only in a POST body; no customer names in URLs/logs.
 void _previous;
 await tenant();
 try{if(!isSection(section))throw new Error('Invalid section');return await queryRecords(section,{q:text(data,'q',100,false),sort:text(data,'sort',30,false),status:text(data,'status',30,false),view:text(data,'view',30,false),page:text(data,'page',10,false)});}catch{return {rows:[],count:0,page:1,error:'Die Suche konnte nicht ausgeführt werden. Bitte erneut versuchen.'};}
}
