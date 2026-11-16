# Campaign log — true delivery state, 15 Nov 2026

Written after reading Gmail itself rather than trusting the "Message sent" toast.

## How each state was established

- **Delivered\*** — Gmail accepted the message and, after a check of every bounce
  report in the mailbox (`from:mailer-daemon`, `subject:"Delivery Status
  Notification"`, `from:postmaster`), no failure report exists for that address.
  Gmail gives no positive delivery receipt, so this means *no bounce*, not a
  proof of inbox placement.
- **Bounced** — Gmail's Mail Delivery Subsystem names the address and quotes the
  remote server's rejection. The quote is reproduced below.
- **Replied** — a message from the recipient found by subject search, in the
  inbox, in the archive, or in spam.

Bounce inventory at the time of writing: **6 reports, 3 distinct addresses** — the
same three addresses were rejected in the morning campaign *and* in this one.
Replies found: **none** (searched the inbox, spam, and `-from:me` searches on
every subject line used).

## October list — 81 schools, second touch

Every row below was emailed the 30-day-trial follow-up. "Delivered\*" means no
bounce report.

| # | School | Contact | Email | State |
|---|---|---|---|---|
| 1 | Chelmer Valley High | Mr S Halstead, HoD Business | shalstead@chelmer.essex.sch.uk | delivered\* |
| 2 | Cardinal Newman Catholic | Nina Bassett, HoD Business | nina.bassett@hccmac.co.uk | delivered\* |
| 3 | Rivington & Blackrod High | Mr D Petrie, HoD Business | dpetrie@rbhs.co.uk | delivered\* |
| 4 | Little Heath School | Mr Howlett, Head of Business & Economics | thowlett@littleheath.org.uk | delivered\* |
| 5 | Stanborough School | Mrs C Ramsamy, HoD Business | CRamsamy@stanborough.herts.sch.uk | delivered\* |
| 6 | Quinton House School | Paul Chapman, Head of Business | paul.chapman@quintonhouseschool.co.uk | delivered\* |
| 7 | Kenilworth School | Mr P Hodgson, HoD Business | P.Hodgson@kssf.kmat.org.uk | delivered\* |
| 8 | St Clere's School | Miss E Izegbu, HoD Business | e.izegbu.scs@osborne.coop | **bounced** — `550 5.4.1 Recipient address rejected: Access denied` → re-sent to info@osborne.coop (published on osborne.coop/contact-us) FAO Ms E Izegbu — accepted, no bounce report |
| 9 | St Andrew's C of E High | Mr T Lee, Head of Business | leet@sta-worthing.com | delivered\* |
| 10 | Hammersmith Academy | Mr K Ahmed, Head of Business & Economics | KAhmed@hammersmithacademy.org | delivered\* |
| 11 | Cleeve School | Mr M Prior, Head of Business & Economics | mgp@cleeveschool.net | delivered\* |
| 12 | Southgate School | Ms W Betari, HoD Business | wbetari@southgate.enfield.sch.uk | delivered\* |
| 13 | Richard Hale School | Mrs S Davey, HoD Business | sda@richardhale.co.uk | delivered\* |
| 14 | Kettering Buccleuch Academy | Andy Major, Economics & Business | andrewmajor@kba.uk | delivered\* |
| 15 | St Paul's Catholic College | Mr J Newman, Head of Business | jnewman@st-pauls.surrey.sch.uk | delivered\* |
| 16 | Ryburn Valley High | Mr R Brearley, Head of Business & ICT | r.brearley@ryburn.tlt.school | delivered\* |
| 17 | Edgbarrow School | Mrs R Heffernan, HoD Business | rema.heffernan@edgbarrowschool.co.uk | delivered\* |
| 18 | Thornton College | Mrs C Kelly, Head of Business & Economics | ckelly@thorntoncollege.com | delivered\* |
| 19 | Baines School | Mrs E Kasmir, Subject Leader Business | ekr@baines.lancs.sch.uk | delivered\* |
| 20 | Woodcote High School | Mr K Middleton, HoD Business | kmiddleton@woodcotehigh.org.uk | delivered\* |
| 21 | Haberdashers' Hatcham College | Ms B Read, Business | b.read@habstrustsouth.org.uk | delivered\* |
| 22 | St Catherine's Catholic | Business Studies (via office) | info@stccg.co.uk | delivered\* |
| 23 | Blythe Bridge High | Mr G Broomhall, Curriculum Leader | G.Broomhall@bb-hs.co.uk | delivered\* |
| 24 | Downside School | Mrs S Antill, Head of Economics & Business | SAntill@downside.co.uk | delivered\* |
| 25 | Summerhill School | Mrs R Eardley, HoD Business | reardley@summerhill.dudley.sch.uk | delivered\* |
| 26 | Farmor's School | Mr P Imeson, HoD Business | pimeson@farmors.gloucs.sch.uk | delivered\* |
| 27 | AKS Lytham | Mr G McIntyre, Head of Business Education | Graeme.McIntyre@akslytham.com | delivered\* |
| 28 | Saltash Community School | Mrs C Shepherd, Business | cshepherd@saltashcloud.net | delivered\* |
| 29 | Ravens Wood School | Mr J Ungerer, HoD Business | jun@rws.uk.net | delivered\* |
| 30 | Reed's School | Mr E Fry, Head of Business | efry@reeds.surrey.sch.uk | delivered\* |
| 31 | Weydon School | Mrs A Ballard, Business curriculum lead | aballard@weydonschool.surrey.sch.uk | delivered\* |
| 32 | Sheringham High School | Mr D Green, Head of Business (also AHT) | dgreen@sheringhamhigh.org.uk | delivered\* |
| 33 | Highcrest Academy | Mr S Shah, Head of Business & IT | sshah@highcrestacademy.org.uk | delivered\* |
| 34 | Buxton Community School | Mr C Cooke, Business teacher | CCooke@buxton.derbyshire.sch.uk | delivered\* |
| 35 | Hinchingbrooke School | Mr D Bowen, HoD Business | dbowen@hbk.acesmat.uk | delivered\* |
| 36 | Malbank School | Mr Brownsword, HoD Business | azb@malbank.cheshire.sch.uk | delivered\* |
| 37 | St John Bosco College | Miss L Williams, Head of Business | lwilliams@sjbc.wandsworth.sch.uk | delivered\* |
| 38 | Copthall School | Ms S Mughal, Curriculum Leader Business | s.mughal@copthall.barnet.sch.uk | delivered\* |
| 39 | Aylesbury Grammar School | Mr G Davey, Head of Economics & Business | gdavey@ags.bucks.sch.uk | delivered\* |
| 40 | Presdales School | Mrs N Lawrence, HoD Business | nlawrence@presdales.herts.sch.uk | delivered\* |
| 41 | Derby Cathedral School | Mr T Williamson, Lead Business | T.Williamson@derbycathedralschool.org.uk | **bounced** — `550 5.4.1 Recipient address rejected: Access denied` → re-sent to info@derbycathedralschool.org.uk (published on derbycathedralschool.org.uk/contact) FAO Mr T Williamson — accepted, no bounce report |
| 42 | Bredon School | Mr H Mutumba, Business teacher | mutumbah@bredonschool.co.uk | delivered\* |
| 43 | Lord Lawson Academy | Miss V Ness, Subject Leader Business | vness@lordlawson.academy | delivered\* |
| 44 | Sandhurst School | Miss M Roberts, Business department | mroberts@sandhurstschool.org.uk | delivered\* |
| 45 | Highdown School | Mrs N Barnett, Subject Leader Business | nabarnett@highdown.reading.sch.uk | delivered\* |
| 46 | Beverley High School | Mr S Gouldthorpe, Head of Business & Economics | s.gouldthorpe@beverleyhigh.net | delivered\* |
| 47 | Putteridge High School | Mr Choudry, Subject Leader Business | schoudry@putteridgehigh.org | delivered\* |
| 48 | St Anselm's Catholic | Mr R Follington, Curriculum Leader Business | r.follington@st-anselms.org.uk | delivered\* |
| 49 | The Regis School | K Ainsworth, Business teacher | kainsworth@theregisschool.co.uk | delivered\* |
| 50 | Preston School | Mr T Kendall, Subject Leader | timothy.kendall@preston.mnsp.org.uk | delivered\* |
| 51 | Holy Trinity School | Mrs A Holton, Subject Leader Business & Economics | aholton@holytrinitycrawley.org.uk | delivered\* |
| 52 | Trinity High School | Mrs K Loader, Head of Business | loaderk@trinityhigh.net | delivered\* |
| 53 | Barnard Castle School | Mr D F White, Head of Business | dfw@barneyschool.org.uk | delivered\* |
| 54 | Droitwich Spa High | Mr S Buckler, Head of Business & Economics | BucklerSR@droitwichspahigh.worcs.sch.uk | delivered\* |
| 55 | Lampton School | Mrs R Gill, Subject Leader Business | rgill@lampton.org.uk | delivered\* |
| 56 | Lea Manor High | Mr S Khan, Head of Business | SKhan@leamanorhighschool.org | delivered\* |
| 57 | Forge Valley School | A Archer, Subject Leader Business | aarcher@forgevalley.sheffield.sch.uk | **bounced** — `550 5.4.1 Recipient address rejected: Access denied` → re-sent to info@forgevalley.school (published on forgevalley.school/contact-us) FAO Mr A Archer — accepted, no bounce report |
| 58 | Knights Templar School | Mr A Catlin, Subject Leader Business | acatlin@kts.school | delivered\* |
| 59 | Princes Risborough School | Mr M Lucas, HoD Business & Economics | mlucas@prsbucks.com | delivered\* |
| 60 | Three Rivers Academy | Mr R Blackiston, Head of Business & Economics | ryan.blackiston@threerivers.thpt.org.uk | delivered\* |
| 61 | Haberdashers' Crayford | Mr L Safo-Antwi, Head of Business | l.safo-antwi@habstrustsouth.org.uk | delivered\* |
| 62 | Torquay Academy | Mr Lennon, Subject Leader Business | mlennon@tqacademy.co.uk | delivered\* |
| 63 | Christ's College | Ms J Mark, Head of Business | jmark@christscollege.surrey.sch.uk | delivered\* |
| 64 | Bishop Justus C of E | Mr J Lansana, Business & Economics | lansanaj@bishopjustus.bromley.sch.uk | delivered\* |
| 65 | Islip Manor High | Mrs R Balkissoon, Subject Leader | rbalkissoon@islipmanorhigh.org.uk | delivered\* |
| 66 | St Thomas More Catholic | Ms P Carlomagno, HoD Business | pcarlomagno@stmcomprehensive.org | delivered\* |
| 67 | William Edwards School | Mrs K French, Department Leader | frenchk@wes.swecet.org | delivered\* |
| 68 | Gordon's School | Mrs N Brar-Gill, Head of Business | nbrar-gill@gordons.school | delivered\* |
| 69 | The Stanway School | Ms E Conway, HoD Business | STA-HeadOfBusiness@stanway.school | delivered\* |
| 70 | Ferndown Upper School | Miss A Costello, Head of Faculty | AniCostello@fernup.dorset.sch.uk | delivered\* |
| 71 | The Bulmershe School | Dr P Arko, Head of Business & Economics | parko@bulmershe.wokingham.sch.uk | delivered\* |
| 72 | Waingels College | Mrs Kaur, Business & Economics Subject Leader | bus@waingels.wokingham.sch.uk | delivered\* |
| 73 | Ursuline High School | Ms L Maryam, Head of Economics & Business | leena.maryam@ursulinehigh.merton.sch.uk | delivered\* |
| 74 | Ark Putney Academy | Ms H Van De Kaa, Head of Business & Enterprise | H.VanDeKaa@arkputneyacademy.org | delivered\* |
| 75 | John Kyrle High | Mr C Treanor, Subject Lead Business | c.treanor@jkhs.org.uk | delivered\* |
| 76 | Stockport School | Mr J McMahon, Director of Business & Economics | j.mcmahon@stockport.stockport.sch.uk | delivered\* |
| 77 | The Windsor Boys' School | Mrs E Gascoigne, Business Studies | ekalinowska@twbs.co.uk | delivered\* |
| 78 | St Peter's Catholic School | Mrs C Thomas, Head of Business Studies | cthomas@st-peters.surrey.sch.uk | delivered\* |
| 79 | Gumley House School FCJ | Mrs J Lilleyman, HoD Business | jlilleyman@gumleyhouse.com | delivered\* |
| 80 | Park High School | Miss Cinar, HoD Business | ycinar1.310@parkhighstanmore.org.uk | delivered\* |
| 81 | The Hamble School | Mr T Baldwin, Head of Business & IT | tbaldwin@thehambleschool.co.uk | delivered\* |

## New leads and the warm contact — 12 recipients

| # | School | Contact | Email | State |
|---|---|---|---|---|
| 1 | Charter North Dulwich | Ms A Ismail, Subject Leader Business | AIsmail@charternorthdulwich.org.uk | delivered\* |
| 2 | Harlington School | Ms N Jana, Business & Economics | njana@harlingtonschool.org | delivered\* |
| 3 | The Westgate School, Slough | Mrs Khan, Head of Department Business | ZK@westgate.slough.sch.uk | delivered\* |
| 4 | Epsom College | Sash Naicker, Head of Business & BTEC | sash.naicker@epsomcollege.org.uk | delivered\* |
| 5 | The Skinners' School | Stuart Cowley, Head of Business | stuart.cowley@skinners-school.org.uk | delivered\* |
| 6 | The King's School, Gloucester | Mrs T DelValle, Head of Business & Economics | T.DelValle@thekingsschool.co.uk | delivered\* |
| 7 | Sir Thomas Rich's School | Miss R A Downes, Head of Business | rad@strs.org.uk | delivered\* |
| 8 | The Blandford School | Mr R Opalka, Head of Business and ICT | ROpalka@blandfordschool.org.uk | delivered\* |
| 9 | Victoria College, Jersey | Mr Tim Hutton, Head of Business Studies | t.hutton@vcj.sch.je | delivered\* |
| 10 | St Joseph's Catholic High, Slough | Mr A Goza, Head of Business and Economics | a.goza@st-josephs.slough.sch.uk | delivered\* |
| 11 | Toot Hill School | Mr M Rogers, Head of Business Studies | mrogers@toothillschool.co.uk | delivered\* |
| 12 | Herschel Grammar (existing user) | Mr Noel | bno@herschel.slough.sch.uk | delivered\* |

## Totals, stated plainly

- Recipients emailed: **93** (81 October + 11 new heads of business + Mr Noel).
- **Accepted with no bounce report: 90.**
- **Hard-bounced: 3** — all `550 5.4.1 Recipient address rejected: Access denied`
  from Microsoft 365, quoted above.
- **Recovered by re-sending to a published office address: 3 of 3** — those
  addresses are on the schools' own contact pages, not invented; each was
  accepted with no bounce report afterwards.
- **Replies: 0.** No teacher has answered any message in this campaign.

So: 90 of 93 were genuinely accepted on the first attempt and 3 were rejected by
the school's mail server and then reached via the office. **None of the 93 is
silently lost** — the three that failed are named with the mail server's own
words, and their schools were contacted another way.

## Funnel proof — walked as a cold visitor, 15 Nov 2026

A brand-new account was created through the live signup form on
https://www.gcse.business (Teacher → Create → "Start my 30-day trial"):

- Account: `gcse.business.hgs+funnelcheck2215@gmail.com`, name "Ms Funnel Check".
  Clearly a test account; it is the only signup this campaign produced and is
  labelled as such here and in the progress note.
- **No verification email is sent.** The project contains no mail-sending code,
  so registration signs the teacher straight in. There was no verification link
  to follow and nothing arrived in the inbox or spam; that is a design choice,
  not a broken step, but it is worth knowing before a school asks.
- The dashboard banner the new account saw, after the fix below:
  *"Free trial — 30 days left. Unlimited classes and students, every feature, no
  card."*
- Three classes were created through the UI and three students added to one of
  them (`Amelia Watson`, `Ben Carter`, `Priya Sharma`); the live API then showed
  `classes: 3, limit: null, canCreateClass: true` and 3 student records. A fourth
  class was created later to test the list refresh. **No paywall, error or
  upgrade wall appeared at any point.**

### Defects found on the walk, and their fixes

| # | Defect | Fix | Commit |
|---|---|---|---|
| 1 | Dashboard and Classes banners said "Unlimited classes and every feature" — the locked promise is unlimited **students** as well | both banners now read "Unlimited classes and students" | `a33030f` |
| 2 | Right after "Class created", the list still said "No classes yet" for ~7 seconds while the collection cache caught up — reads as a failed save | the created class is inserted into the list straight from the POST response | `a33030f` |
| 3 | The only buy path was a `mailto:` link; school devices routinely block mail handlers, so a teacher could reach the licence page and have no way to send anything | `/upgrade` now carries a real enquiry form (name, school, reply-to, role, note) that POSTs to `/api/enquiry`, stores the entry and confirms on the page; the email link stays as the alternative | `a33030f` |
| 4 | A test enquiry had no way to be cleared from the owner queue | owner-gated `DELETE /api/enquiry?id=` | `6b2bd56` |

### The enquiry test — what works and what is still blocked

Submitted twice, once through the live form and once against the live API:
`{"ok":true,"id":"enq_d28603ebd6"}` and `enq_efb56f1586`. Both were read back
through the owner endpoint with the sender address and message intact:

```
enq_d28603ebd6 | Ms Funnel Check | Funnelcheck High School |
  gcse.business.hgs+funnelcheck2215@gmail.com |
  Test enquiry submitted through the live /upgrade form during the funnel walk.
```

**It does not reach a Gmail inbox, and that is the honest gap.** The project has
no mail transport of any kind — no SMTP, no provider SDK, no API key in the
environment — and `arnavjain1009@gmail.com` is not a mailbox this environment can
open. So the enquiry is *captured and owner-visible* rather than *emailed*. The
endpoint already sends through Resend the moment `RESEND_API_KEY` exists; until
that key (or a Gmail app password) is provided, inbox arrival and spam placement
cannot be proven from here.

Both test enquiries were deleted afterwards, and all four test classes (with
their students) were removed through the live API, leaving zero classes, zero
students and zero enquiries.

## 16 Nov (overnight) — delivery proven

- `gcse.business` verified in Resend; enquiry mail now comes from
  `enquiries@gcse.business` with the teacher as Reply-To, plus an acknowledgement
  to the teacher. Proof: `last_event: delivered` for a real submission to
  `arnavjain@gcse.business`, and the acknowledgement found in the Gmail **inbox**.
- Production still has no `RESEND_API_KEY` (`/api/health` → `"email":"none"`), so a
  scheduled GitHub Action relays unsent enquiries with the key held as a repo
  secret. Run `43776953889` sent an enquiry with no human involved; rerun sent
  nothing (`ownerSent: 0`).
- Same job now alerts every new trial signup, so no 30-day window starts unseen.
- `/debug` gained a licence-request inbox (with per-entry delivery state) and the
  teacher feedback inbox that was never mounted.
- Perfect-paper check: `16/16` — the marker awards full marks for full marks.
- No replies yet: 93 recipients / 90 accepted / 3 bounced-and-resent / **0 replies**.

## 16 Nov — delivery ledger

- 12 Resend messages, **12 delivered**, 0 bounced: 4 owner copies, 4 teacher
  acknowledgements, 1 signup alert, 1 trial reminder, 2 earlier tests.
- Acknowledgement confirmed in the Gmail inbox by hand.
- Trial reminders (7 days, final day) now send from the same job; proven with a
  6-day account and idempotent on rerun.
- Database cleaned: 3 teacher records left (Mr Noel, demo persona, owner).
- 0 replies from the 93 schools; visits 108, signups 3 real.
