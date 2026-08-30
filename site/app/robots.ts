import type { MetadataRoute } from 'next'; import { company } from './company';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots { return { rules:{userAgent:'*',allow:'/',disallow:['/api/']},sitemap:`${company.url}/sitemap.xml`,host:company.url }; }
