export type Decision = "ready" | "review" | "blocker";
export type RequirementStatus =
  "verified" | "missing_evidence" | "hard_blocker" | "human_review";
export interface CompanyProject {
  id: string;
  title: string;
  clientType: string;
  year: number;
  valueRange: string;
  outcome: string;
  tags: string[];
  referenceReady?: boolean;
}
export interface CompanyProfile {
  name: string;
  headquarters: string;
  employeeCount: number;
  regions: string[];
  capabilities: string[];
  certifications: string[];
  projects: CompanyProject[];
  insuranceExpiry: string;
  procurementContact: string;
  insuranceCoverageMillions?: number;
  lastReviewed?: string;
}
export interface TenderRequirement {
  id: string;
  text: string;
  mandatory: boolean;
  sourceReference: string;
  requiredCapabilities?: string[];
  requiredCertifications?: string[];
  kind?: "region" | "insurance" | "projects" | "security";
  minimumProjects?: number;
  minimumInsuranceMillions?: number;
}
export interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  buyer: string;
  source: "CanadaBuys" | "Ontario Tenders";
  sourceUrl: string;
  publishedDate: string;
  closingDate: string;
  sector: string;
  location: string;
  description: string;
  requirements: TenderRequirement[];
  evaluationCriteria: { name: string; weight: number; suggestion: string }[];
  requiredRegions: string[];
  keywords: string[];
  aiFallbackInsight: string;
  serviceCapabilities: string[];
  projectTags: string[];
  idealTeamSize: number;
  comparableProjects: number;
  strategicGap?: string;
}
export interface MatchResult {
  tenderId: string;
  score: number;
  decision: Decision;
  serviceFit: number;
  eligibility: number;
  projectEvidence: number;
  operationalFit: number;
  summary: string;
  reasons: string[];
  requirementStatuses: Record<string, RequirementStatus>;
  nextActions: {
    id: string;
    title: string;
    timing: string;
    owner: string;
    complete: boolean;
  }[];
}
export interface CoachInsight {
  headline: string;
  assessment: string;
  priorityActions: string[];
  watchouts: string[];
}
