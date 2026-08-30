import {notFound} from 'next/navigation';
import Link from 'next/link';
import {isSection,sections} from '@/lib/fields';
import {Heading} from '@/components/ui';
import {RecordForm} from '@/components/record-form';
export default async function Page({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{customer_id?:string;deal_id?:string}>}){const {section}=await params;if(!isSection(section))notFound();const query=await searchParams;return <><Heading title={`${sections[section].singular} anlegen`}><Link href={`/portal/${section}`}>Abbrechen</Link></Heading><section className="panel"><RecordForm section={section} values={{customer_id:query.customer_id??null,deal_id:query.deal_id??null}}/></section></>;}
