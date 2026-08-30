// Guards are UX only; database rules authorize every request.
export function staticHref(href: string) {
 if (!href.startsWith('/') || href.startsWith('//')) return href;
 const index = href.search(/[?#]/), path = index < 0 ? href : href.slice(0,index), suffix = index < 0 ? '' : href.slice(index);
 return (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : path + '/') + suffix;
}
export function redirect(path: string): never {
 if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Ungültiges Ziel.');
 window.location.replace(staticHref(path));
 throw new Error('Navigation');
}
export function notFound(): never { throw new Error('Eintrag nicht verfügbar.'); }
export function revalidatePath(_path?: string, _type?: string) {
 void _path; void _type;
 window.dispatchEvent(new Event('nexus:refresh'));
}
