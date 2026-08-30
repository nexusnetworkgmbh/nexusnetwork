import Link from 'next/link';
import {notFound} from 'next/navigation';
import {sections,isSection} from '@/lib/fields';
import {queryRecords} from '@/lib/list-query';
import {Heading} from '@/components/ui';
import {RecordList} from '@/components/record-list';
export default async function ListPage({params}:{params:Promise<{section:string}>}){
 const {section}=await params;if(!isSection(section))notFound();
 const initial=await queryRecords(section,{});const definition=sections[section];
 return <><Heading title={definition.title} description={definition.description}><Link className="button primary" href={`/portal/${section}/new`}>+ {definition.singular} anlegen</Link></Heading><RecordList section={section} initial={initial}/></>;
}
