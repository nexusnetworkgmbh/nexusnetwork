'use client';
import {notFound} from '@/lib/navigation';
import Link from '@/components/link';
import {isSection,sections} from '@/lib/fields';
import {Heading} from '@/components/ui';
import {RecordForm} from '@/components/record-form';
export async function load({params,searchParams}:{params:Promise<Record<string,string>>;searchParams:Promise<Record<string,string>>}){const {section}=await params;if(!isSection(section))notFound();const query=await searchParams;return <><Heading title={`${sections[section].singular} anlegen`}><Link href={`/portal/${section}`}>Abbrechen</Link></Heading><section className="panel"><RecordForm section={section} values={{customer_id:query.customer_id??null,deal_id:query.deal_id??null}}/></section></>;}
