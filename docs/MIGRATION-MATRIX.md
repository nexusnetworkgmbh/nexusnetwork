# Static migration — inventory and security mapping

Baseline: commit 4321ff2. Next.js 16.2.6 / React 19.2.6, App Router in both applications. Website already exports statically. Portal is force-dynamic, SSR, @supabase/ssr, HTTP-only cookies, Next proxy, callback Route Handler and Server Actions. No Pages Router, separate API routes, Edge Functions or Storage feature. No real environment file found. Secret key is referenced only in a disposable-local test script and the old empty template, not runtime CRUD.

| Function | Before | Security boundary retained / new implementation |
|---|---|---|
| Registration / login / recovery | Server Actions + Supabase Auth | Official browser Supabase JS PKCE, Auth provider owns credentials and verification; DB bootstrap ignores role/status metadata |
| Session restore / logout | SSR cookies / proxy | Official SDK storage, live getUser + DB profile; RLS session_valid checks verified user and live auth.sessions row |
| Callback | GET handler, server code exchange | Static callback, SDK exchange, allowlisted destination, URL code removal, no token logging |
| Page guards | Server account/tenant/admin | Browser UX only, neutral loading/error, no permission fallbacks; DB remains authority |
| Customer/deal/task create/update | Server field allowlist and tenant helper | Browser UX validation; existing tenant RLS, DB ownership trigger, length/status/FK constraints; additional email validation |
| Organization assignment | Server first membership + DB trigger | Same membership lookup for UX; DB member_of/can_work always verifies auth.uid, immutable ownership on UPDATE |
| Profile edits | Server allowlist | DB column-level UPDATE grants only first_name/last_name/phone; roles/status/system fields inaccessible |
| Partner onboarding | Server action calls RPC | Existing authorized private.save_onboarding via invoker wrapper; payload bounds and NULL-submit checks added |
| Partner approval | Server admin guard + RPC | Existing private.review_partner verifies active DB admin, prevents self/privileged targets; NULL status guard added |
| Search and pagination | Server POST -> REST GET | New SECURITY INVOKER search_records RPC, JSON POST, bounded inputs and allowlisted SQL identifiers; RLS still applies |
| Deal number | PostgreSQL sequence + trigger | Unchanged atomic DB generation; client value overwritten |
| Status history | DB trigger | Unchanged append-only history, no client INSERT/UPDATE/DELETE grants |
| Audit | DB triggers | Unchanged server actor/time; no client writes; profile privilege changes recorded |
| Relationships / task assignee | Composite FKs + trigger | Preserved tenant FKs, task/deal/customer consistency, member assignment |
| Dynamic record/admin URLs | Runtime [id] routes | Fixed detail/edit routes with UUID query params; finite section routes generated at build time |
| Public website / SEO | Static Next export | Preserved; same-origin /login link, merged with portal via distinct asset prefixes |
| Security headers | Next server headers | Removed false server-header promises; post-build hash CSP meta + referrer meta, Pages limitations documented |

All ten public business tables exist: profiles, organizations, organization_members, partner_profiles, customers, deals, deal_status_history, deal_notes, tasks, audit_logs. All have RLS. No DELETE workflow is authorized, including own-tenant deletion. No business data may be loaded at build time.

No remote schema changes are authorized/executed as part of this offline migration. Available connector lists only unrelated OpusQuest; no NexusNetwork project or Docker executable is available. Real REST/JWT/SMTP/OAuth acceptance remains mandatory and blocked until a dedicated synthetic-data test project is supplied.
