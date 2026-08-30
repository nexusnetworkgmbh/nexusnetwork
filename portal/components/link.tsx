import type { AnchorHTMLAttributes } from 'react';
import { staticHref } from '@/lib/navigation';
export default function Link({href, ...props}: AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) {
 return <a {...props} href={staticHref(href)} />;
}
