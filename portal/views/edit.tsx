'use client';
import {notFound} from '@/lib/navigation';
import Link from '@/components/link';
import {tenant} from '@/lib/access';
import {isSection,sections} from '@/lib/fields';
import {uuid} from '@/lib/validation';
import {Heading} from '@/components/ui';
import {RecordForm} from '@/components/record-form';
export async function load({params}:{params:Promise<Record<string,string>>;searchParams:Promise<Record<string,string>>}){const {section,id}=await params;if(!isSection(section))notFound();try{uuid(id);}catch{notFound();}const {db,organizationId}=await tenant();const {data,error}=await db.from(section).select('*').eq('id',id).eq('organization_id',organizationId).maybeSingle();if(error)throw new Error('Eintrag konnte nicht geladen werden.');if(!data)notFound();return <><Heading title={`${sections[section].singular} bearbeiten`}><Link href={`/portal/${section}/detail?id=${id}`}>Abbrechen</Link></Heading><section className="panel"><RecordForm section={section} id={id} values={data}/></section></>;}
