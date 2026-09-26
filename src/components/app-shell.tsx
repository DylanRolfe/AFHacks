"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  Compass,
  LayoutDashboard,
  Menu,
  Search,
  Sparkle,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useCompany } from "./company-provider";

export function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        <Sparkle size={23} strokeWidth={1.7} />
      </span>
      BidNorth<span className="logo-dot">.</span>
    </span>
  );
}
const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Compass },
  { href: "/profile", label: "Company profile", icon: Building2 },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { company } = useCompany();
  const [open, setOpen] = useState(false);
  const section = path.startsWith("/opportunities")
    ? "Opportunities"
    : path === "/profile"
      ? "Company profile"
      : path === "/methodology"
        ? "Sources & methodology"
        : "Overview";
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="BidNorth overview"
          >
            <Logo />
          </Link>
          <button
            className="icon-button mobile-only"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <Link
          className="workspace-switch"
          href="/profile"
          onClick={() => setOpen(false)}
        >
          <span className="workspace-icon">NG</span>
          <span>
            <strong>{company.name}</strong>
            <small>Company workspace</small>
          </span>
          <ChevronDown size={14} />
        </Link>
        <div className="nav-eyebrow">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} />
                <span>{label}</span>
                {href === "/opportunities" && (
                  <span className="nav-count">12</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-star">
              <Sparkle size={16} />
            </span>
            <strong>A clearer path to public work.</strong>
            <p>The right opportunity starts with knowing where you fit.</p>
            <Link href="/opportunities" onClick={() => setOpen(false)}>
              Explore opportunities <ArrowUpRight size={14} />
            </Link>
          </div>
          <Link
            href="/methodology"
            className={`nav-link ${path === "/methodology" ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <BookOpen size={17} />
            Sources & methodology
          </Link>
          <div className="demo-workspace">
            <span />
            Demo workspace <span className="version">v1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-brand">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span>{section}</span>
          </div>
          <div className="topbar-right">
            <Link
              href="/opportunities"
              className="icon-button header-search"
              aria-label="Search opportunities"
            >
              <Search size={18} />
            </Link>
            <span className="topbar-divider" />
            <Link href="/profile" className="user-chip">
              <span className="avatar">
                {company.procurementContact
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("") || "NG"}
              </span>
              <span>{company.procurementContact || "Your profile"}</span>
              <ChevronDown size={13} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <span className="footer-maple">✦</span> Built for Canadian
            businesses.
          </span>
          <span>
            Demo tender dataset <span className="footer-dot">·</span>{" "}
            <Link href="/methodology">
              Transparent by design <ArrowUpRight size={12} />
            </Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
