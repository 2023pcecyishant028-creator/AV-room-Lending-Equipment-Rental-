"use client";

import { useEffect, useMemo, useState } from "react";

type Gear = { id: number; name: string; category: string; icon: string; total: number; available: number; rate: number; deposit: number; color: string };
type Loan = { id: number; borrower: string; group: string; item: string; quantity: number; due: string; deposit: number; status: "Active" | "Due today" | "Overdue" };

const initialGear: Gear[] = [
  { id: 1, name: "Canon EOS 90D", category: "Cameras", icon: "◎", total: 4, available: 2, rate: 12, deposit: 120, color: "coral" },
  { id: 2, name: "Epson EB-X51", category: "Projectors", icon: "▣", total: 3, available: 1, rate: 18, deposit: 150, color: "blue" },
  { id: 3, name: "Rode Wireless GO II", category: "Audio", icon: "◉", total: 6, available: 5, rate: 8, deposit: 80, color: "lime" },
  { id: 4, name: "Manfrotto Tripod", category: "Support", icon: "⌁", total: 8, available: 8, rate: 5, deposit: 50, color: "yellow" },
  { id: 5, name: "Sony A6400", category: "Cameras", icon: "◎", total: 3, available: 0, rate: 15, deposit: 100, color: "coral" },
  { id: 6, name: "Shure SM58", category: "Audio", icon: "◉", total: 10, available: 7, rate: 6, deposit: 60, color: "lime" },
];
const initialLoans: Loan[] = [
  { id: 101, borrower: "Aisha Patel", group: "Film Society", item: "Canon EOS 90D", quantity: 1, due: "2026-09-17", deposit: 120, status: "Due today" },
  { id: 102, borrower: "Marcus Chen", group: "Robotics Club", item: "Epson EB-X51", quantity: 1, due: "2026-09-19", deposit: 150, status: "Active" },
  { id: 103, borrower: "Priya Nair", group: "Debate Union", item: "Rode Wireless GO II", quantity: 2, due: "2026-09-14", deposit: 160, status: "Overdue" },
];
const today = new Date("2026-09-17T12:00:00");
const money = (value: number) => `$${value.toFixed(2)}`;

export default function Home() {
  const [gear, setGear] = useState(initialGear);
  const [loans, setLoans] = useState(initialLoans);
  const [tab, setTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All gear");
  const [booking, setBooking] = useState<Gear | null>(null);
  const [returning, setReturning] = useState<Loan | null>(null);
  const [transferring, setTransferring] = useState<Loan | null>(null);
  const [notice, setNotice] = useState("");
  const categories = ["All gear", ...Array.from(new Set(gear.map((item) => item.category)))];
  const filtered = useMemo(() => gear.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (category === "All gear" || item.category === category)), [gear, query, category]);
  const overdue = loans.filter((loan) => loan.status === "Overdue").length;

  useEffect(() => {
    const openTransfer = (event: Event) => setTransferring((event as CustomEvent<Loan>).detail);
    window.addEventListener("transfer-loan", openTransfer);
    return () => window.removeEventListener("transfer-loan", openTransfer);
  }, []);

  function createBooking(item: Gear, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const borrower = String(values.get("borrower") || "").trim();
    const group = String(values.get("group") || "").trim();
    const quantity = Number(values.get("quantity"));
    const due = String(values.get("due"));
    if (!borrower || !group || !due || quantity < 1 || quantity > item.available) return;
    setGear((current) => current.map((entry) => entry.id === item.id ? { ...entry, available: entry.available - quantity } : entry));
    setLoans((current) => [{ id: Date.now(), borrower, group, item: item.name, quantity, due, deposit: item.deposit * quantity, status: due === "2026-09-17" ? "Due today" : "Active" }, ...current]);
    setBooking(null);
    setNotice(`${item.name} booked for ${borrower}. Deposit due: ${money(item.deposit * quantity)}.`);
  }

  function completeReturn() {
    if (!returning) return;
    const item = gear.find((entry) => entry.name === returning.item);
    const daysLate = Math.max(0, Math.ceil((today.getTime() - new Date(`${returning.due}T12:00:00`).getTime()) / 86400000));
    const lateFee = daysLate * 3 * returning.quantity;
    if (item) setGear((current) => current.map((entry) => entry.id === item.id ? { ...entry, available: Math.min(entry.total, entry.available + returning.quantity) } : entry));
    setLoans((current) => current.filter((loan) => loan.id !== returning.id));
    setReturning(null);
    setNotice(`${returning.item} returned. Refund ${money(Math.max(0, returning.deposit - lateFee))}${lateFee ? ` after ${money(lateFee)} late fee` : ""}.`);
  }

  function completeTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transferring) return;
    const values = new FormData(event.currentTarget);
    const borrower = String(values.get("borrower") || "").trim();
    const group = String(values.get("group") || "").trim();
    if (!borrower || !group) return;
    setLoans((current) => current.map((loan) => loan.id === transferring.id ? { ...loan, borrower, group } : loan));
    setTransferring(null);
    setNotice(`${transferring.item} transferred to ${borrower}. Due date remains ${transferring.due}.`);
  }

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">AV</span><span>AV room<br /><strong>lending desk</strong></span></div><div className="desk-label">OPERATIONS</div><nav className="nav-list" aria-label="Main navigation">{["Overview", "Gear library", "Active loans", "Returns & fees"].map((item) => <button className={`nav-item ${tab === item ? "selected" : ""}`} key={item} onClick={() => setTab(item)}><span className="nav-icon">{item === "Overview" ? "⌂" : item === "Gear library" ? "▦" : item === "Active loans" ? "↗" : "↩"}</span>{item}{item === "Active loans" && <span className="nav-count">{loans.length}</span>}</button>)}</nav><div className="sidebar-foot"><div className="desk-status"><span className="status-dot" /> Desk open <span>09:00–17:00</span></div><div className="user-chip"><span className="avatar">IJ</span><span><strong>Ishant</strong><small>Desk manager</small></span><span className="chevron">⌄</span></div></div></aside>
    <section className="content"><header className="topbar"><div className="crumb">AV ROOM <span>/</span> {tab.toUpperCase()}</div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♧<i /></button><button className="help-button">? <span>Help</span></button></div></header><div className="page-wrap"><div className="page-heading"><div><p className="eyebrow">THURSDAY, 17 SEPTEMBER 2026</p><h1>{tab === "Overview" ? "Good morning, Ishant." : tab}</h1><p className="subheading">Here&apos;s what&apos;s happening at the desk today.</p></div><button className="primary-button" onClick={() => setBooking(gear.find((item) => item.available > 0) || null)}>＋ New booking</button></div>{notice && <div className="toast" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
      {tab === "Overview" && <><div className="metric-grid"><Metric icon="◒" tone="sun" label="On loan today" value={`${loans.reduce((sum, loan) => sum + loan.quantity, 0)}`} suffix="items" note="↑ 12%  vs last week" /><Metric icon="✓" tone="mint" label="Available now" value={`${gear.reduce((sum, item) => sum + item.available, 0)}`} suffix={`of ${gear.reduce((sum, item) => sum + item.total, 0)}`} note="● 3 reserved  for later" /><Metric icon="!" tone="peach" label="Needs attention" value={`${overdue}`} suffix="overdue" note="↘ 2 due today  check in soon" /></div><div className="content-grid"><GearPanel items={filtered.slice(0, 4)} query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} onBook={setBooking} onAll={() => setTab("Gear library")} /><LoanPanel loans={loans} onReturn={setReturning} onAll={() => setTab("Returns & fees")} /></div></>}
      {tab === "Gear library" && <section className="panel full-panel"><PanelHeading title="All equipment" copy={`${filtered.length} gear types across the room.`} /><Toolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} /><div className="gear-list">{filtered.map((item) => <GearRow item={item} onBook={() => setBooking(item)} key={item.id} />)}</div></section>}
      {(tab === "Active loans" || tab === "Returns & fees") && <section className="panel full-panel"><PanelHeading title={tab} copy="Every item currently outside the room." />{loans.length ? <div className="return-list">{loans.map((loan) => <LoanRow loan={loan} onReturn={() => setReturning(loan)} key={loan.id} />)}</div> : <div className="empty-state"><span>✓</span><h3>Everything is back</h3><p>No active returns waiting for a check-in.</p></div>}</section>}
    </div></section>
    {booking && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setBooking(null)}><form className="modal" onSubmit={(event) => createBooking(booking, event)}><button type="button" className="close-button" onClick={() => setBooking(null)}>×</button><p className="eyebrow">NEW BOOKING</p><h2>Reserve {booking.name}</h2><p className="modal-copy">{booking.available} unit{booking.available !== 1 ? "s" : ""} available · ${booking.rate}/day · ${booking.deposit} refundable deposit per unit</p><label>Borrower name<input name="borrower" placeholder="e.g. Aisha Patel" required /></label><label>Club or department<input name="group" placeholder="e.g. Film Society" required /></label><div className="form-row"><label>Quantity<select name="quantity" defaultValue="1">{Array.from({ length: booking.available }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} unit{index ? "s" : ""}</option>)}</select></label><label>Return date<input name="due" type="date" min="2026-09-17" defaultValue="2026-09-19" required /></label></div><button className="primary-button wide" type="submit">Confirm booking <span>→</span></button></form></div>}
    {returning && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setReturning(null)}><div className="modal return-modal"><button type="button" className="close-button" onClick={() => setReturning(null)}>×</button><p className="eyebrow">CHECK IN GEAR</p><h2>Return {returning.item}?</h2><p className="modal-copy">Borrowed by {returning.borrower} · due {returning.due}</p><div className="refund-box"><span>Refundable deposit</span><strong>{money(returning.deposit)}</strong><small>Late fee: {money(Math.max(0, Math.ceil((today.getTime() - new Date(`${returning.due}T12:00:00`).getTime()) / 86400000)) * 3 * returning.quantity)}</small></div><button className="primary-button wide" onClick={completeReturn}>Confirm return <span>→</span></button></div></div>}
    {transferring && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setTransferring(null)}><form className="modal" onSubmit={completeTransfer}><button type="button" className="close-button" onClick={() => setTransferring(null)}>×</button><p className="eyebrow">TRANSFER ACTIVE LOAN</p><h2>Transfer {transferring.item}</h2><p className="modal-copy">Currently with {transferring.borrower}. The due date stays {transferring.due} and availability will not change.</p><label>New borrower<input name="borrower" placeholder="e.g. Neha Shah" required /></label><label>New club or department<input name="group" placeholder="e.g. Film Society" required /></label><button className="primary-button wide" type="submit">Confirm transfer <span>→</span></button></form></div>}
  </main>;
}

function Metric({ icon, tone, label, value, suffix, note }: { icon: string; tone: string; label: string; value: string; suffix: string; note: string }) { return <div className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value} <small>{suffix}</small></strong><em className={tone === "peach" ? "down" : tone === "mint" ? "neutral" : "up"}>{note}</em></div></div>; }
function PanelHeading({ title, copy, onAll }: { title: string; copy: string; onAll?: () => void }) { return <div className="panel-heading"><div><h2>{title}</h2><p>{copy}</p></div>{onAll && <button className="text-button" onClick={onAll}>View all <span>→</span></button>}</div>; }
function Toolbar({ query, setQuery, category, setCategory, categories }: { query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; categories: string[] }) { return <div className="toolbar"><label className="search"><span>⌕</span><input aria-label="Search gear" placeholder="Search gear..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter gear" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>; }
function GearPanel({ items, query, setQuery, category, setCategory, categories, onBook, onAll }: { items: Gear[]; query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; categories: string[]; onBook: (item: Gear) => void; onAll: () => void }) { return <section className="panel gear-panel"><PanelHeading title="Gear library" copy="Find, check and lend equipment." onAll={onAll} /><Toolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} /><div className="gear-list">{items.map((item) => <GearRow item={item} onBook={() => onBook(item)} key={item.id} />)}</div></section>; }
function LoanPanel({ loans, onReturn, onAll }: { loans: Loan[]; onReturn: (loan: Loan) => void; onAll: () => void }) { return <section className="panel loans-panel"><PanelHeading title="Returns due" copy="Keep the room moving." onAll={onAll} /><div className="return-list">{loans.map((loan) => <LoanRow loan={loan} onReturn={() => onReturn(loan)} key={loan.id} />)}</div></section>; }
function GearRow({ item, onBook }: { item: Gear; onBook: () => void }) { const available = item.available > 0; return <div className="gear-row"><span className={`gear-art ${item.color}`}>{item.icon}</span><div className="item-name"><strong>{item.name}</strong><span>{item.category}</span></div><div className="availability"><span className={available ? "available-dot" : "empty-dot"} /><strong>{available ? `${item.available} available` : "All out"}</strong><small>{available ? `of ${item.total} total` : "Back soon"}</small></div><button className="row-action" disabled={!available} onClick={onBook}>{available ? "Book" : "Unavailable"}</button></div>; }
function LoanRow({ loan, onReturn }: { loan: Loan; onReturn: () => void }) { return <div className="loan-row"><span className="loan-avatar">{loan.borrower.split(" ").map((part) => part[0]).join("")}</span><div className="item-name"><strong>{loan.borrower}</strong><span>{loan.group} · {loan.quantity} {loan.quantity === 1 ? "item" : "items"}</span></div><div className="loan-item"><strong>{loan.item}</strong><span>Due {loan.due === "2026-09-17" ? "today" : loan.due}</span></div><span className={`loan-status ${loan.status.toLowerCase().replace(" ", "-")}`}>{loan.status}</span><button className="row-action" onClick={() => window.dispatchEvent(new CustomEvent("transfer-loan", { detail: loan }))}>Transfer</button><button className="row-action return-action" onClick={onReturn}>Return</button></div>; }
