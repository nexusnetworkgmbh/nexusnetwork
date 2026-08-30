import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Nexus Network | Partnerportal',template:'%s | Nexus Network'},description:'Ihr geschützter Arbeitsbereich für Kunden, Vermittlungen und Wiedervorlagen.',robots:{index:false,follow:false},icons:{icon:'/nexus-brand.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body><a className="skip-link" href="#content">Zum Inhalt</a>{children}</body></html>;}
