import type { MetadataRoute } from 'next'; import { company } from './company';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return ['','/finanzberater-anbindung','/finanzanlagenvermittler','/impressum','/datenschutz'].map((path,i)=>({url:`${company.url}${path}`,lastModified:new Date(),changeFrequency:i===0?'weekly':'monthly',priority:i===0?1:i<3?.8:.3})); }
