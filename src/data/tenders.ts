import type { Tender, TenderRequirement } from "@/types/procurement";

export const DATASET_DATE = "2026-09-26";
export const METHODOLOGY =
  "BidNorth assesses documented readiness using the company profile and tender record. It does not predict award outcomes or replace review of official procurement documents, amendments, deadlines, and submission instructions.";
const registration: TenderRequirement = {
  id: "registration",
  text: "Ontario business registration",
  mandatory: true,
  sourceReference: "Tender §3.2",
  requiredCertifications: ["Ontario business registration"],
};
const insurance: TenderRequirement = {
  id: "insurance",
  text: "Professional liability insurance of at least $2M",
  mandatory: true,
  sourceReference: "Tender §3.4",
  kind: "insurance",
  requiredCertifications: ["Professional liability insurance"],
  minimumInsuranceMillions: 2,
};
const coverage: TenderRequirement = {
  id: "coverage",
  text: "Ontario implementation coverage",
  mandatory: true,
  sourceReference: "Tender §3.3",
  kind: "region",
};
const projects: TenderRequirement = {
  id: "projects",
  text: "Two comparable projects with client references",
  mandatory: true,
  sourceReference: "Tender §4.1",
  kind: "projects",
  minimumProjects: 2,
};
const criteria: Tender["evaluationCriteria"] = [
  {
    name: "Technical approach",
    weight: 45,
    suggestion:
      "Map your delivery workflow to the buyer’s scope, reporting needs, and acceptance criteria.",
  },
  {
    name: "Relevant experience",
    weight: 35,
    suggestion:
      "Select comparable projects and quantify outcomes, scope, and client context.",
  },
  {
    name: "Value and pricing",
    weight: 20,
    suggestion: "Show phased delivery and transparent milestone pricing.",
  },
];
type Seed = Pick<
  Tender,
  | "id"
  | "title"
  | "buyer"
  | "sector"
  | "description"
  | "serviceCapabilities"
  | "projectTags"
  | "keywords"
  | "closingDate"
> &
  Partial<Tender>;
function tender(seed: Seed, index: number): Tender {
  const source = seed.source ?? (index % 2 ? "Ontario Tenders" : "CanadaBuys");
  return {
    tenderNumber: `DEMO-${source === "CanadaBuys" ? "CA" : "ON"}-2026-${String(index + 1).padStart(3, "0")}`,
    source,
    sourceUrl:
      source === "CanadaBuys"
        ? "https://canadabuys.canada.ca/en/tender-opportunities"
        : "https://ontariotenders.app.jaggaer.com/",
    publishedDate: `2026-09-${String(14 + index).padStart(2, "0")}`,
    location: "Ontario",
    requiredRegions: ["Ontario"],
    requirements: [registration, insurance, coverage, projects],
    evaluationCriteria: criteria,
    idealTeamSize: 40,
    comparableProjects: 2,
    aiFallbackInsight:
      "Use the closest comparable project to demonstrate the delivery approach, and verify the complete solicitation package before committing resources.",
    ...seed,
  };
}

// Illustrative notices, buyers and section references. These are not live records.
// Portal links identify the public source context, not an actual solicitation.
export const tenders: Tender[] = [
  tender(
    {
      id: "energy-retrofit",
      title: "Energy Efficiency Retrofit Services",
      buyer: "Natural Resources Canada",
      sector: "Clean energy",
      closingDate: "2026-10-15",
      description:
        "Assess a portfolio of Ontario facilities, develop an energy-efficiency retrofit roadmap, and establish facility-level carbon and performance reporting.",
      serviceCapabilities: [
        "Energy-management software",
        "Building retrofits",
        "Utility analytics",
        "Project management",
      ],
      keywords: ["energy", "retrofit", "analytics", "carbon"],
      projectTags: ["energy", "retrofit"],
      requirements: [
        registration,
        insurance,
        {
          ...projects,
          text: "Two comparable energy-retrofit or energy-management projects",
        },
        coverage,
        {
          id: "security",
          text: "Security/clearance requirement",
          mandatory: true,
          sourceReference: "Tender §3.6 - security schedule",
          kind: "security",
        },
        {
          id: "methodology",
          text: "Carbon-reduction measurement methodology",
          mandatory: false,
          sourceReference: "Tender §5.2",
          requiredCapabilities: ["Utility analytics"],
        },
      ],
      evaluationCriteria: [
        {
          name: "Technical approach",
          weight: 45,
          suggestion:
            "Connect the proposed energy-management workflow to the buyer’s facility portfolio and reporting needs.",
        },
        {
          name: "Relevant experience",
          weight: 35,
          suggestion:
            "Lead with the Waterloo utility project and quantify the outcome.",
        },
        criteria[2],
      ],
      aiFallbackInsight:
        "Lead with the Waterloo utility rollout and the portfolio retrofit assessment. Quantify their outcomes and prepare client references before drafting.",
    },
    0,
  ),
  tender(
    {
      id: "energy-platform",
      title: "Municipal Building Energy Management Platform",
      buyer: "Ontario Infrastructure and Lands Corporation",
      sector: "Technology",
      closingDate: "2026-10-22",
      description:
        "Configure a cloud energy-management platform for a municipal building portfolio, with meter integration, reporting, and staff onboarding.",
      serviceCapabilities: [
        "Energy-management software",
        "Utility analytics",
        "Project management",
        "Meter integration",
      ],
      keywords: ["software", "analytics", "utility", "integration"],
      projectTags: ["software", "analytics"],
      idealTeamSize: 48,
      requirements: [
        registration,
        insurance,
        coverage,
        projects,
        {
          id: "soc2",
          text: "SOC 2 Type II attestation",
          mandatory: true,
          sourceReference: "Tender §3.5",
          requiredCertifications: ["SOC 2 Type II"],
        },
      ],
    },
    1,
  ),
  tender(
    {
      id: "climate-advisory",
      title: "Climate Data Modernization Advisory Services",
      buyer: "Environment and Climate Change Canada",
      sector: "Advisory",
      location: "Hybrid / remote",
      requiredRegions: [],
      closingDate: "2026-11-04",
      description:
        "Design a modernization roadmap for climate datasets, data governance, and analytical reporting across program teams.",
      serviceCapabilities: [
        "Utility analytics",
        "Project management",
        "Climate science",
        "Data governance",
      ],
      keywords: ["analytics", "public sector", "governance", "climate"],
      projectTags: ["analytics", "public sector"],
      strategicGap:
        "Verify climate-science and data-governance capability before committing proposal resources.",
      idealTeamSize: 65,
      requirements: [
        insurance,
        {
          ...projects,
          text: "Two comparable data-modernization advisory projects",
        },
      ],
    },
    2,
  ),
  tender(
    {
      id: "ev-charging",
      title: "EV Fleet Charging Infrastructure",
      buyer: "City of Kingston",
      sector: "Infrastructure",
      closingDate: "2026-11-10",
      description:
        "Plan fleet charging capacity and coordinate deployment of charging infrastructure across municipal depots.",
      serviceCapabilities: [
        "Building retrofits",
        "Project management",
        "Electrical installation",
        "EV charging",
      ],
      keywords: ["charging", "electrical", "depot", "installation"],
      projectTags: ["retrofit", "utility"],
      idealTeamSize: 60,
      comparableProjects: 3,
      strategicGap:
        "Verify licensed electrical installation capability before committing proposal resources.",
    },
    3,
  ),
  tender(
    {
      id: "cybersecurity",
      title: "Cybersecurity Managed Services",
      buyer: "Ontario Ministry of Public and Business Service Delivery",
      source: "Ontario Tenders",
      sector: "Technology",
      closingDate: "2026-10-28",
      description:
        "Provide a 24/7 security operations centre, managed detection, incident response, and cybersecurity reporting.",
      serviceCapabilities: [
        "Managed detection",
        "Incident response",
        "Security operations",
        "Vulnerability management",
      ],
      keywords: ["software", "analytics", "incident", "cybersecurity"],
      projectTags: ["security", "cybersecurity"],
      requirements: [
        insurance,
        coverage,
        {
          id: "cyber",
          text: "Demonstrated managed cybersecurity service capability",
          mandatory: true,
          sourceReference: "Tender §3.6",
          requiredCapabilities: ["Security operations"],
        },
      ],
      idealTeamSize: 80,
    },
    4,
  ),
  tender(
    {
      id: "road-reconstruction",
      title: "Road Reconstruction General Contractor",
      buyer: "Ontario Ministry of Transportation",
      sector: "Construction",
      closingDate: "2026-11-12",
      description:
        "Deliver road reconstruction, drainage, grading, and traffic management under a general construction contract.",
      serviceCapabilities: [
        "Road construction",
        "Civil engineering",
        "Heavy equipment",
      ],
      keywords: ["road", "drainage", "grading", "construction"],
      projectTags: ["road", "construction"],
      requirements: [
        {
          id: "construction",
          text: "Road construction general-contractor capability",
          mandatory: true,
          sourceReference: "Tender §3.1",
          requiredCapabilities: ["Road construction"],
        },
        {
          id: "bond",
          text: "Construction bonding qualification",
          mandatory: true,
          sourceReference: "Tender §3.2",
          requiredCertifications: ["Construction bonding"],
        },
        coverage,
      ],
      idealTeamSize: 100,
    },
    5,
  ),
  tender(
    {
      id: "energy-modelling",
      title: "Energy Modelling and Verification Services",
      buyer: "Ontario Ministry of Infrastructure",
      source: "Ontario Tenders",
      sector: "Clean energy",
      closingDate: "2026-11-06",
      description:
        "Model building energy performance and develop a measurement and verification framework for retrofit investment decisions.",
      serviceCapabilities: [
        "Utility analytics",
        "Building retrofits",
        "Energy modelling",
      ],
      keywords: [
        "energy",
        "retrofit",
        "modelling",
        "verification",
        "calibration",
      ],
      projectTags: ["energy", "retrofit"],
      idealTeamSize: 65,
    },
    6,
  ),
  tender(
    {
      id: "public-dashboard",
      title: "Public Sector Data Dashboard",
      buyer: "Public Services and Procurement Canada",
      source: "CanadaBuys",
      sector: "Technology",
      location: "Hybrid / remote",
      requiredRegions: [],
      closingDate: "2026-11-18",
      description:
        "Develop an accessible dashboard that consolidates operational data and performance indicators for a public-sector program.",
      serviceCapabilities: [
        "Utility analytics",
        "Energy-management software",
        "Accessible design",
      ],
      keywords: [
        "analytics",
        "public sector",
        "software",
        "energy",
        "utility",
        "accessibility",
      ],
      projectTags: ["public sector", "analytics"],
      idealTeamSize: 75,
      comparableProjects: 3,
      requirements: [insurance, projects],
    },
    7,
  ),
  tender(
    {
      id: "solar-feasibility",
      title: "Solar Feasibility Study",
      buyer: "Regional Municipality of Durham",
      source: "Ontario Tenders",
      sector: "Clean energy",
      closingDate: "2026-11-20",
      description:
        "Evaluate rooftop solar potential, interconnection options, and financial feasibility across municipal properties.",
      serviceCapabilities: [
        "Building retrofits",
        "Utility analytics",
        "Solar engineering",
        "Financial modelling",
      ],
      keywords: ["photovoltaic", "interconnection", "solar", "financial"],
      projectTags: ["energy", "utility"],
      idealTeamSize: 75,
      strategicGap:
        "Verify solar-engineering capability for interconnection and array design before proposal work.",
    },
    8,
  ),
  tender(
    {
      id: "fleet-hardware",
      title: "Fleet Telematics Hardware Supply",
      buyer: "Transport Canada",
      source: "CanadaBuys",
      sector: "Supply",
      closingDate: "2026-11-24",
      description:
        "Supply and support vehicle telematics units, installation kits, and hardware warranties for a federal fleet.",
      serviceCapabilities: [
        "Hardware supply",
        "Vehicle installation",
        "Project management",
      ],
      keywords: ["analytics", "software", "vehicle", "telematics"],
      projectTags: ["hardware", "vehicle"],
      requirements: [
        insurance,
        {
          id: "reseller",
          text: "Authorized telematics hardware reseller",
          mandatory: true,
          sourceReference: "Tender §3.5",
          requiredCertifications: ["Authorized telematics reseller"],
        },
      ],
      idealTeamSize: 65,
    },
    9,
  ),
  tender(
    {
      id: "building-automation",
      title: "Building Automation Assessment",
      buyer: "Ontario Infrastructure and Lands Corporation",
      source: "Ontario Tenders",
      sector: "Clean energy",
      closingDate: "2026-10-29",
      description:
        "Assess building automation controls and recommend practical upgrades for energy efficiency and operational visibility.",
      serviceCapabilities: [
        "Building retrofits",
        "Utility analytics",
        "Project management",
      ],
      keywords: [
        "energy",
        "retrofit",
        "analytics",
        "controls",
        "automation",
        "hvac",
        "commissioning",
      ],
      projectTags: ["energy", "retrofit"],
      idealTeamSize: 50,
    },
    10,
  ),
  tender(
    {
      id: "sustainability-reporting",
      title: "Sustainability Reporting Services",
      buyer: "Parks Canada",
      source: "CanadaBuys",
      sector: "Advisory",
      location: "Hybrid / remote",
      requiredRegions: [],
      closingDate: "2026-11-26",
      description:
        "Consolidate environmental performance data and establish an auditable sustainability reporting process across facilities.",
      serviceCapabilities: [
        "Utility analytics",
        "Project management",
        "Sustainability reporting",
      ],
      keywords: [
        "analytics",
        "public sector",
        "energy",
        "carbon",
        "verification",
      ],
      projectTags: ["energy", "public sector"],
      idealTeamSize: 80,
      requirements: [insurance, projects],
    },
    11,
  ),
];
