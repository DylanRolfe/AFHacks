"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { CompanyProfile } from "@/types/procurement";
import { defaultCompany } from "@/data/company";
import { companySchema } from "@/lib/validation";

const STORAGE_KEY = "bidnorth.company.v1";
const CompanyContext = createContext<{
  company: CompanyProfile;
  saveCompany: (p: CompanyProfile) => boolean;
  hydrated: boolean;
}>({ company: defaultCompany, saveCompany: () => false, hydrated: false });
export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompany);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const videoDemo =
      window.location.pathname === "/demo" ||
      new URLSearchParams(window.location.search).get("demo") === "video";
    if (videoDemo) {
      setHydrated(true);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = companySchema.safeParse(JSON.parse(stored));
        if (parsed.success) setCompany(parsed.data);
      }
    } catch {
      /* Private mode or corrupted storage: the default workspace stays usable. */
    }
    setHydrated(true);
  }, []);
  function saveCompany(value: CompanyProfile) {
    const next = companySchema.parse({
      ...value,
      lastReviewed: new Date().toISOString().slice(0, 10),
    });
    setCompany(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  }
  return (
    <CompanyContext.Provider value={{ company, saveCompany, hydrated }}>
      {children}
    </CompanyContext.Provider>
  );
}
export const useCompany = () => useContext(CompanyContext);
