'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="content" className="error-page"><p className="eyebrow">NEXUS NETWORK</p><h1>Das hat leider nicht geklappt.</h1><p>Der Bereich konnte nicht geladen werden. Bitte versuchen Sie es erneut. Falls das Problem bleibt, wenden Sie sich an den Betreiber.</p><button onClick={reset}>Erneut versuchen</button></main>;}
