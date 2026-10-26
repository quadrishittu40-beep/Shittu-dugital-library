"use client";

import { useMemo, useState } from "react";
import {
  BookOpen, Search, Bell, LayoutDashboard, LibraryBig, Feather, Bookmark,
  Settings2, ChartNoAxesColumnIncreasing, Upload, Plus, Clock3, FileText,
  BookMarked, GraduationCap, Landmark, Microscope, ArrowRight, X, Check,
  Moon, Sun, UserRound, ChevronRight, Menu, Sparkles
} from "lucide-react";

type Work = { id: number; title: string; category: string; status: "Draft" | "Published"; updated: string; description: string };
const initialWorks: Work[] = [];
const categories = [
  { name: "Islamic Studies", count: "Explore", icon: BookOpen },
  { name: "Academic Lesson Notes", count: "Explore", icon: GraduationCap },
  { name: "Research & Essays", count: "Explore", icon: FileText },
  { name: "History & Culture", count: "Explore", icon: Landmark },
  { name: "Science & Technology", count: "Explore", icon: Microscope },
  { name: "Poetry & Literature", count: "Explore", icon: Feather },
  { name: "Friday Sermons", count: "Explore", icon: BookMarked },
  { name: "Personal Development", count: "Explore", icon: Sparkles }
];

export default function Home() {
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"write" | "upload" | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Islamic Studies");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const [portrait, setPortrait] = useState("");
  const [portraitName, setPortraitName] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredWorks = useMemo(() => works.filter(w => `${w.title} ${w.category} ${w.description}`.toLowerCase().includes(query.toLowerCase())), [works, query]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const createWork = () => {
    if (!title.trim()) { notify("Add a title before saving your work."); return; }
    setWorks(prev => [{ id: Date.now(), title: title.trim(), category, status: "Draft", updated: "Just now", description }, ...prev]);
    setTitle(""); setDescription(""); setModal(null);
    notify("Draft added to this preview. Connect the database to make it permanent.");
  };
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard }, { label: "My Works", icon: Feather },
    { label: "Explore Library", icon: LibraryBig }, { label: "Reading Lists", icon: Bookmark },
    { label: "Reading History", icon: Clock3 }
  ];
  const navBottom = [{ label: "Analytics", icon: ChartNoAxesColumnIncreasing }, { label: "Settings", icon: Settings2 }];
  const go = (label: string) => { setActiveNav(label); if (label !== "Dashboard") notify(`${label} is part of the planned next implementation stage.`); setMobileMenu(false); };

  return (
    <div className={`app-shell ${dark ? "dark-preview" : ""}`} style={dark ? { background: "#111a29", color: "#e9edf3" } : undefined}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">M</div><div><div className="brand-title">My Digital Library</div><div className="brand-sub">KNOWLEDGE • PRESERVED</div></div></div>
        <div><div className="nav-label">WORKSPACE</div><div className="nav-group">{navItems.map(item => <button key={item.label} onClick={() => go(item.label)} className={`nav-link ${activeNav === item.label ? "active" : ""}`}><item.icon />{item.label}</button>)}</div></div>
        <div><div className="nav-label">MANAGE</div><div className="nav-group">{navBottom.map(item => <button key={item.label} onClick={() => go(item.label)} className={`nav-link ${activeNav === item.label ? "active" : ""}`}><item.icon />{item.label}</button>)}</div></div>
        <div className="nav-bottom"><div className="profile-mini"><div className="portrait-placeholder">M</div><div><strong>Library Owner</strong><small>Personal workspace</small></div></div></div>
      </aside>

      <main className="main">
        <div className="mobile-brand"><div className="brand-mark">M</div><div><div className="brand-title">My Digital Library</div><div className="brand-sub" style={{ color: "#9a762f", fontSize: "9px" }}>KNOWLEDGE • PRESERVED</div></div></div>
        <header className="topbar">
          <div className="breadcrumb">Workspace <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {activeNav}</div>
          <div className="top-actions">
            <label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your library..." aria-label="Search your library"/></label>
            <button className="icon-btn" onClick={() => notify("You’re all caught up.")} aria-label="Notifications"><Bell/></button>
            <button className="icon-btn" onClick={() => setDark(v => !v)} aria-label="Toggle reading theme">{dark ? <Sun/> : <Moon/>}</button>
          </div>
        </header>

        <div className="eyebrow">YOUR PERSONAL KNOWLEDGE HUB</div>
        <h1 className="page-title">A home for your ideas.</h1>
        <p className="page-subtitle" style={{ marginBottom: 22 }}>Write, preserve, discover and return to the knowledge that matters.</p>

        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">WELCOME TO YOUR LIBRARY</div>
            <h2>Every great idea<br/>deserves a place.</h2>
            <p>Your personal writing studio and a world of reading, brought together in one thoughtful space.</p>
            <div className="hero-actions">
              <button className="btn btn-gold" onClick={() => setModal("write")}><Plus size={16}/> Write a New Work</button>
              <button className="btn btn-ghost" onClick={() => notify("Public catalog browsing will be enabled with the database stage.")}>Explore the Library <ArrowRight size={15}/></button>
            </div>
          </div>
          <label className="hero-portrait" title="Upload your portrait">
            <input type="file" accept="image/*" hidden onChange={e => { const f=e.target.files?.[0]; if(f){setPortrait(URL.createObjectURL(f));setPortraitName(f.name);notify("Portrait preview updated. Save branding settings when backend is connected.");}}}/>
            {portrait ? <img src={portrait} alt="Portrait preview" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/> : <div><UserRound/><span>Your portrait<br/>will appear here</span></div>}
          </label>
        </section>

        <div className="section-heading"><div><h3>Your library at a glance</h3><p>A little progress, one page at a time.</p></div></div>
        <section className="stats-grid" aria-label="Library statistics">
          <div className="stat-card"><div className="stat-top">My Works <span className="stat-icon"><Feather/></span></div><div className="stat-number">{works.length}</div><div className="stat-note">Your authored documents</div></div>
          <div className="stat-card"><div className="stat-top">Published <span className="stat-icon"><BookOpen/></span></div><div className="stat-number">{works.filter(w=>w.status==="Published").length}</div><div className="stat-note">Shared with readers</div></div>
          <div className="stat-card"><div className="stat-top">Drafts <span className="stat-icon"><FileText/></span></div><div className="stat-number">{works.filter(w=>w.status==="Draft").length}</div><div className="stat-note">Ideas in progress</div></div>
          <div className="stat-card"><div className="stat-top">Reading Lists <span className="stat-icon"><Bookmark/></span></div><div className="stat-number">0</div><div className="stat-note">Books saved for later</div></div>
        </section>

        <div className="content-grid">
          <section>
            <div className="section-heading"><div><h3>My latest works</h3><p>Your writing, organized in one place.</p></div><button className="text-link" onClick={() => go("My Works")}>View all →</button></div>
            <div className="panel">
              <div className="panel-head"><h4>Recently updated</h4><span>{filteredWorks.length} works</span></div>
              {filteredWorks.length ? filteredWorks.slice(0,4).map(w=><div className="work-row" key={w.id}><div className="work-cover"><FileText/></div><div className="work-info"><strong>{w.title}</strong><small>{w.category} · {w.updated}</small></div><span className={`status ${w.status.toLowerCase()}`}>{w.status}</span></div>) : <div className="empty-state"><strong>{query ? "No matching works yet" : "Your story starts here."}</strong>{query ? "Try a different title, topic or category." : "You haven’t added any works yet. Create your first draft and build your personal collection."}<div style={{marginTop:13}}><button className="btn btn-gold" onClick={()=>setModal("write")}><Plus size={15}/> Create your first work</button></div></div>}
            </div>
          </section>
          <section>
            <div className="section-heading"><div><h3>Quick actions</h3><p>Keep your ideas moving.</p></div></div>
            <div className="quick-grid">
              <button className="quick-action" onClick={()=>setModal("write")}><span className="quick-icon"><Feather/></span><strong>Write a new work</strong><small>Start an article, book or lesson note.</small></button>
              <button className="quick-action" onClick={()=>setModal("upload")}><span className="quick-icon"><Upload/></span><strong>Upload a document</strong><small>Bring your existing files with you.</small></button>
              <button className="quick-action" onClick={()=>go("Explore Library")}><span className="quick-icon"><LibraryBig/></span><strong>Explore library</strong><small>Discover useful works and authors.</small></button>
              <button className="quick-action" onClick={()=>go("Reading Lists")}><span className="quick-icon"><Bookmark/></span><strong>Reading list</strong><small>Keep important reading close.</small></button>
            </div>
          </section>
        </div>

        <div className="section-heading"><div><h3>Explore by subject</h3><p>Follow your curiosity wherever it leads.</p></div><button className="text-link" onClick={()=>go("Explore Library")}>Browse all →</button></div>
        <section className="category-grid">{categories.map(c=><button className="category-card" key={c.name} onClick={()=>{setQuery(c.name);notify(`Showing matching works for ${c.name}.`)}}><span className="category-symbol"><c.icon/></span><span><strong>{c.name}</strong><small>{c.count} publications</small></span></button>)}</section>
        <div className="notice"><Sparkles/><div><strong>Make this space yours.</strong> Upload your portrait using the framed placeholder above. This first foundation uses preview-only local state; account authentication, persistent database storage and secure document uploads are the next implementation stages.</div></div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">{[{label:"Home",icon:LayoutDashboard},{label:"My Works",icon:Feather},{label:"Explore",icon:LibraryBig},{label:"Saved",icon:Bookmark},{label:"Settings",icon:Settings2}].map(n=><button key={n.label} onClick={()=>go(n.label==="Home"?"Dashboard":n.label)} className={activeNav===(n.label==="Home"?"Dashboard":n.label)?"active":""}><n.icon/><span>{n.label}</span></button>)}</nav>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:15}}><div><div className="eyebrow">{modal==="write"?"PERSONAL AUTHORING STUDIO":"ADD TO YOUR COLLECTION"}</div><h3 id="modal-title">{modal==="write"?"Create a new work":"Upload a document"}</h3><p>{modal==="write"?"Begin with a title and category. You can refine your draft as the writing studio grows.":"Choose a document from your phone or computer."}</p></div><button className="icon-btn" onClick={()=>setModal(null)} aria-label="Close dialog"><X/></button></div>
        {modal==="write" ? <><div className="field"><label htmlFor="work-title">Work title *</label><input id="work-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. The Value of Integrity"/></div><div className="field"><label htmlFor="work-category">Category</label><select id="work-category" value={category} onChange={e=>setCategory(e.target.value)}>{["Books","Articles","Essays","Research Papers","Islamic Studies","Qur'an and Hadith Studies","Friday Sermons","Civic Education","Social Studies","Academic Lesson Notes","Poetry and Creative Writing","Personal Reflections","Miscellaneous"].map(c=><option key={c}>{c}</option>)}</select></div><div className="field"><label htmlFor="work-description">Short note (optional)</label><textarea id="work-description" value={description} onChange={e=>setDescription(e.target.value)} placeholder="What is this work about?"/></div><div className="modal-actions"><button className="btn btn-light" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-gold" onClick={createWork}><Check size={15}/> Save preview draft</button></div></> :
        <><div className="field"><label htmlFor="document">Select document (PDF, DOCX, TXT, MD, EPUB)</label><input id="document" type="file" accept=".pdf,.docx,.txt,.md,.epub" onChange={e=>setFileName(e.target.files?.[0]?.name||"")}/>{fileName&&<small style={{color:"#28734c"}}>{fileName} selected</small>}</div><div className="notice"><Upload/><div>File selection is ready in this UI foundation. Secure cloud storage and upload processing are not connected yet.</div></div><div className="modal-actions"><button className="btn btn-light" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-gold" onClick={()=>{setModal(null);notify(fileName?`${fileName} selected; cloud upload will be enabled in the backend stage.`:"Choose a file first.")}}>Continue</button></div></>}
      </section></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}