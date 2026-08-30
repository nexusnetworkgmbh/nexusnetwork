import {notFound} from 'next/navigation';
import Link from 'next/link';
import {tenant} from '@/lib/access';
import {isSection,sections} from '@/lib/fields';
import {uuid} from '@/lib/validation';
import {Heading} from '@/components/ui';
import {RecordForm} from '@/components/record-form';
export default async function Page({params}:{params:Promise<{section:string;id:string}>}){const {section,id}=await params;if(!isSection(section))notFound();try{uuid(id);}catch{notFound();}const {db,organizationId}=await tenant();const {data,error}=await db.from(section).select('*').eq('id',id).eq('organization_id',organizationId).maybeSingle();if(error)throw new Error('Eintrag konnte nicht geladen werden.');if(!data)notFound();return <><Heading title={`${sections[section].singular} bearbeiten`}><Link href={`/portal/${section}/${id}`}>Abbrechen</Link></Heading><section className="panel"><RecordForm section={section} id={id} values={data}/></section></>;}
