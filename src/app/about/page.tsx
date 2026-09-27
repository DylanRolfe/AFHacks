import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  FileCheck2,
  ShieldCheck,
  Sparkle,
  UserRoundCheck,
} from "lucide-react";
import { StoryMotion } from "@/components/story-motion";
import { defaultCompany } from "@/data/company";
import { tenders } from "@/data/tenders";
import { calculateMatch } from "@/lib/matching";
import { statusLabels } from "@/lib/readiness";

export const metadata = { title: "Pre-bid readiness for Canadian SMEs" };

const sample = "/opportunities/energy-retrofit?sample=1";
const tender = tenders[0];
const match = calculateMatch(defaultCompany, tender);
const requirements = tender.requirements.filter((requirement) =>
  ["insurance", "registration", "projects", "security"].includes(requirement.id),
);
const shortNames: Record<string, string> = {
  insurance: "$2M professional liability insurance",
  registration: "Ontario business registration",
  projects: "Two comparable projects",
  security: "Required security clearance",
};
const evidence: Record<string, string> = {
  insurance: "$2M declared · expires Dec 2026",
  registration: "Registration declared in profile",
  projects: "One reference ready; second unconfirmed",
  security: "No reviewed clearance evidence",
};
const actions: Record<string, string> = {
  insurance: "Verify policy against the tender",
  registration: "Confirm original document",
  projects: "Prepare second client reference",
  security: "Review the security schedule",
};

function Status({ id }: { id: string }) {
  const status = match.requirementStatuses[id];
  return (
    <span className={["story-status", status].join(" ")}>
      <span aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className="story-page">
      <StoryMotion />

      <section className="story-hero" data-demo="about-hero" aria-labelledby="story-title">
        <div className="story-grid-art" aria-hidden="true" />
        <div className="story-hero-atmosphere" aria-hidden="true">
          <span>REQUIREMENT / §3.2 <i /></span>
          <span>04 / 12 <i /></span>
          <span>EVIDENCE / §4.1 <i /></span>
          <span>MANDATORY / §3.6 <i /></span>
        </div>
        <div className="story-container">
          <nav className="story-nav" aria-label="Public navigation">
            <Link href="/about" className="story-brand" aria-label="BidNorth home">
              <span className="story-brand-mark"><Sparkle size={17} /></span>
              BidNorth<span>.</span>
            </Link>
            <Link href="/overview" className="story-nav-link">
              Open workspace <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </nav>
          <div className="story-hero-stage">
            <div className="story-hero-copy">
              <p className="story-eyebrow">PRE-BID READINESS FOR CANADIAN SMEs</p>
              <h1 id="story-title" data-demo="hero-headline" aria-label="Bid smarter. Find your edge.">
                <span className="story-headline-line"><span>Bid smarter.</span></span>
                <span className="story-headline-line story-headline-final"><span>Find your edge.</span></span>
              </h1>
              <p className="story-hero-lead" data-demo="hero-lead">
                BidNorth turns tender requirements and company evidence into a
                source-aware readiness decision-before a small business spends weeks
                preparing a bid.
              </p>
              <div className="story-actions">
                <Link className="story-button story-button-blue" data-demo="hero-cta" href={sample}>
                  See a sample readiness check <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a className="story-text-link" href="#mission">
                  Our mission <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="story-hero-visual" data-demo="hero-ledger" aria-label="Illustrative Bid Readiness Ledger">
              <div className="story-hero-ledger">
                <div className="story-hero-ledger-top">
                  <span className="story-ledger-kicker">BID READINESS LEDGER</span>
                  <span className="story-ledger-number">SAMPLE · 01 / 04</span>
                </div>
                <div className="story-hero-ledger-title">
                  <p>Natural Resources Canada</p>
                  <h2>Energy Efficiency<br />Retrofit Services</h2>
                  <span className="story-hero-outcome">Fix gaps first <ArrowRight size={15} aria-hidden="true" /></span>
                </div>
                <div className="story-hero-requirements">
                  {requirements.map((requirement) => (
                    <div
                      className={["story-hero-requirement", match.requirementStatuses[requirement.id]].join(" ")}
                      data-demo={`hero-requirement-${requirement.id}`}
                      key={requirement.id}
                    >
                      <span className="story-hero-requirement-name">
                        <small>{requirement.sourceReference}</small>
                        {shortNames[requirement.id]}
                      </span>
                      <Status id={requirement.id} />
                    </div>
                  ))}
                </div>
                <div className="story-hero-ledger-foot">
                  <span>Source context attached to each check</span>
                  <span>02 / 04 VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
          <div className="story-scroll-cue" aria-hidden="true"><span /> SCROLL TO EXPLORE</div>
        </div>
      </section>

      <section className="story-manifesto" id="mission" data-demo="mission" aria-labelledby="mission-title">
        <div className="story-grid-art" aria-hidden="true" />
        <div className="story-manifesto-fragments" aria-hidden="true">
          <span>§3.2 / MANDATORY</span><span>§4.1 / EVIDENCE</span><span>REVIEW REQUIRED</span>
        </div>
        <div className="story-manifesto-sticky">
          <div className="story-container">
            <p className="story-eyebrow">OUR MISSION</p>
            <h2 id="mission-title" data-demo="mission-title">
              <span>READINESS</span>
              <span>REQUIRES</span>
              <span>PROOF.</span>
            </h2>
            <p className="story-manifesto-statement" data-demo="mission-statement">
              <span data-manifesto-phrase>We turn scattered tender requirements </span>
              <span data-manifesto-phrase>and fragmented company evidence </span>
              <span data-manifesto-phrase>into a clear, source-aware readiness ledger-</span>
              <span data-manifesto-phrase>so Canadian SMEs can resolve gaps </span>
              <span data-manifesto-phrase>before they commit to a bid.</span>
            </p>
            <div className="story-manifesto-progress" aria-hidden="true"><span /></div>
          </div>
        </div>
      </section>

      <section className="story-proof-transition" data-demo="proof-transition" aria-label="From scattered requirements to an organized readiness decision">
        <div className="story-container story-transition-layout" data-reveal>
          <div className="story-transition-scattered" aria-hidden="true">
            <span>§3.2<br />Registration</span>
            <span>§3.4<br />Insurance</span>
            <span>§4.1<br />Project evidence</span>
            <span>§3.6<br />Security review</span>
          </div>
          <div className="story-transition-arrow" aria-hidden="true"><ArrowRight size={24} /></div>
          <div className="story-transition-ledger">
            <div><span>ONE READINESS DECISION</span><strong>Evidence before effort.</strong></div>
            <p><Check size={15} /> 2 requirements verified</p>
            <p><span className="story-small-amber" /> 1 item needs evidence</p>
            <p><span className="story-small-violet" /> 1 item needs human review</p>
          </div>
        </div>
      </section>

      <section className="story-problem" data-demo="problem" aria-labelledby="problem-title">
        <div className="story-container story-problem-layout" data-reveal>
          <div>
            <p className="story-eyebrow story-eyebrow-blue">01 / THE COST OF A LATE DISCOVERY</p>
            <h2 id="problem-title" data-demo="problem-title">The most expensive bid is the one a company was never ready to submit.</h2>
            <p className="story-section-lead">
              A promising opportunity can consume days of proposal work before a
              mandatory requirement is found that the business cannot prove.
            </p>
            <ol className="story-problem-timeline">
              <li><span>01</span><strong>Tender discovered</strong><small>A promising public opportunity appears.</small></li>
              <li><span>02</span><strong>Proposal work begins</strong><small>The team commits scarce time and people.</small></li>
              <li className="story-timeline-warning"><span>03</span><strong>Mandatory gap found too late</strong><small>Evidence or clearance cannot be confirmed.</small></li>
              <li><span>04</span><strong>Time and opportunity lost</strong><small>The decision came after the effort.</small></li>
            </ol>
          </div>
          <div className="story-problem-ledger">
            <div className="story-problem-ledger-top">
              <span>REQUIREMENT CHECK / SAMPLE TENDER</span>
              <span>4 ITEMS</span>
            </div>
            {requirements.map((requirement) => (
              <div className={["story-problem-row", match.requirementStatuses[requirement.id]].join(" ")} key={requirement.id}>
                <span>{shortNames[requirement.id]}</span>
                <Status id={requirement.id} />
              </div>
            ))}
            <div className="story-problem-result">
              <span>READINESS OUTCOME</span>
              <strong>Resolve gaps before writing.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="story-canada" data-demo="canada" aria-labelledby="canada-title">
        <div className="story-grid-art" aria-hidden="true" />
        <div className="story-container" data-reveal>
          <p className="story-eyebrow">02 / THE CANADIAN OPPORTUNITY</p>
          <h2 id="canada-title">Public procurement is one of Canada’s largest customer markets.</h2>
          <div className="story-stats">
            <div data-demo="canada-contracts">
              <strong data-count="66.9" data-prefix="$" data-suffix="B">$66.9B</strong>
              <span>Government of Canada contracts awarded in 2024–25.</span>
            </div>
            <div data-demo="canada-smes">
              <strong data-count="63.6" data-suffix="%">63.6%</strong>
              <span>Share of Canada’s private-sector workforce employed by SMEs.</span>
            </div>
          </div>
          <p className="story-canada-takeaway" data-demo="canada-takeaway">
            SMEs account for only 20–30% of PSPC contract value. Making procurement
            easier to navigate can help capable Canadian businesses compete, grow, and hire.
          </p>
          <p className="story-source">
            Sources: <a href="https://www.canada.ca/en/public-services-procurement/news/2026/07/simplifying-federal-procurement-for-canadian-small-businesses.html">Public Services and Procurement Canada, 2026</a>;
            {" "}<a href="https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2025">Innovation, Science and Economic Development Canada, 2025</a>.
          </p>
        </div>
      </section>

      <section className="story-discovery" data-demo="discovery" aria-labelledby="discovery-title">
        <div className="story-container" data-reveal>
          <p className="story-eyebrow story-eyebrow-blue">03 / THE DECISION AFTER DISCOVERY</p>
          <h2 id="discovery-title" data-demo="discovery-title">Finding a tender is only the beginning.</h2>
          <div className="story-bridge" aria-hidden="true">
            <span>Tender found</span><i /><ArrowRight size={21} /><span>Readiness proven</span>
          </div>
          <div className="story-discovery-columns" data-demo="discovery-comparison">
            <div>
              <span className="story-column-index">01 / DISCOVER</span>
              <h3>Government portals</h3>
              <ul>
                <li>Publish opportunities</li>
                <li>Support search and alerts</li>
                <li>Provide public notices</li>
              </ul>
            </div>
            <div>
              <span className="story-column-index">02 / DECIDE</span>
              <h3>BidNorth</h3>
              <ul>
                <li>Checks mandatory requirements</li>
                <li>Maps evidence to requirements</li>
                <li>Flags missing proof</li>
                <li>Shows what to resolve before proposal work begins</li>
              </ul>
            </div>
          </div>
          <p className="story-discovery-note">
            CanadaBuys helps businesses discover opportunities. BidNorth supports the
            readiness decision that follows.
          </p>
        </div>
      </section>

      <section className="story-product" data-demo="product-preview" aria-labelledby="product-title">
        <div className="story-container" data-reveal>
          <div className="story-product-heading">
            <div>
              <p className="story-eyebrow story-eyebrow-blue">04 / THE PRODUCT REVEAL</p>
              <h2 id="product-title">A readiness ledger, not a black-box score.</h2>
            </div>
            <p>Every status connects a requirement to company evidence, source context, and a next action.</p>
          </div>
          <div className="story-product-window" data-demo="product-window">
            <div className="story-window-chrome">
              <span><i /><i /><i /></span>
              <span>BIDNORTH / READINESS CHECK</span>
              <span>ILLUSTRATIVE DATA</span>
            </div>
            <div className="story-product-topline">
              <div>
                <span>Natural Resources Canada · Sample tender</span>
                <h3>Energy Efficiency Retrofit Services</h3>
              </div>
              <span>Closes Oct 15, 2026</span>
            </div>
            <div className="story-product-outcome">
              <span>READINESS OUTCOME</span>
              <strong>Fix gaps before committing proposal resources</strong>
              <small>Two mandatory items are not yet verified.</small>
            </div>
            <div className="story-ledger-table" role="table" aria-label="Illustrative requirement readiness">
              <div className="story-table-head" role="row">
                <span role="columnheader">Requirement</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Company evidence</span>
                <span role="columnheader">Source</span>
                <span role="columnheader">Next action</span>
              </div>
              {requirements.map((requirement) => (
                <div className="story-table-row" role="row" key={requirement.id}>
                  <strong role="cell">{shortNames[requirement.id]}</strong>
                  <span role="cell"><Status id={requirement.id} /></span>
                  <span role="cell">{evidence[requirement.id]}</span>
                  <span role="cell">{requirement.sourceReference}</span>
                  <span role="cell">{actions[requirement.id]}</span>
                </div>
              ))}
            </div>
            <div className="story-product-footer">
              <span>Verify every critical result against the official tender package and amendments.</span>
              <Link href={sample} data-demo="product-cta">
                <span className="story-product-link-normal">Open full sample</span>
                <span className="story-product-link-demo">See a sample readiness check</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="story-principles">
            <div><BookOpenCheck size={19} /><h3>Source-aware</h3><p>Requirement references stay beside the evidence.</p></div>
            <div><UserRoundCheck size={19} /><h3>Human-verified</h3><p>People confirm the original documents and interpretation.</p></div>
            <div><ShieldCheck size={19} /><h3>No win predictions</h3><p>Documented readiness informs action, not award outcomes.</p></div>
          </div>
        </div>
      </section>

      <section className="story-transformation" aria-labelledby="transformation-title">
        <div className="story-container" data-reveal>
          <p className="story-eyebrow story-eyebrow-blue">05 / WHAT CHANGES FOR A SMALL BUSINESS</p>
          <h2 id="transformation-title">From “Should we bid?” to “Here is what we must prove first.”</h2>
          <div className="story-transformation-grid">
            <div className="story-before">
              <div className="story-panel-heading"><span>BEFORE BIDNORTH</span><span>SCATTERED INPUTS</span></div>
              <div className="story-paper">
                <span>01 / TENDER PACKAGE</span>
                <strong>Submission requirements</strong>
                <i /><i /><i /><i />
                <em>Insurance threshold?</em>
                <small>Deadline in 04 days</small>
              </div>
              <div className="story-loose-note">Check clearance schedule<br />and project references</div>
              <p>A founder interprets scattered pages while proposal work has already begun.</p>
            </div>
            <div className="story-after">
              <div className="story-panel-heading"><span>WITH BIDNORTH</span><span>ONE EVIDENCE LEDGER</span></div>
              <div className="story-ordered">
                <div><Check size={16} /><span>Mandatory requirements organized</span></div>
                <div><span className="story-small-amber" /><span>Missing project reference visible</span></div>
                <div><span className="story-small-violet" /><span>Security review assigned to a person</span></div>
                <div><FileCheck2 size={16} /><span>Action plan ordered before drafting</span></div>
              </div>
              <p>The team sees the gaps, owners, and timing before committing proposal resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-future" id="vision" data-demo="roadmap" aria-labelledby="future-title">
        <div className="story-grid-art" aria-hidden="true" />
        <div className="story-container" data-reveal>
          <p className="story-eyebrow">06 / FROM PROTOTYPE TO NATIONAL IMPACT</p>
          <h2 id="future-title">Start with one high-risk decision. Build the supplier-readiness layer for Canada.</h2>
          <div className="story-roadmap">
            <div className="story-roadmap-line" aria-hidden="true" />
            <article data-demo="roadmap-prototype">
              <span className="story-roadmap-dot" aria-hidden="true" />
              <span className="story-roadmap-stage">NOW · CURRENT PROTOTYPE</span>
              <h3>Hackathon Prototype</h3>
              <p>Source-aware ledger, company evidence check, readiness outcome, and action plan for a sample federal tender.</p>
            </article>
            <article data-demo="roadmap-validation">
              <span className="story-roadmap-dot" aria-hidden="true" />
              <span className="story-roadmap-stage">NEXT · PLANNED VALIDATION</span>
              <h3>Validate With Real SMEs</h3>
              <p>Run 10 planned concierge reviews. Test requirement accuracy, decision time, and willingness to use the workflow again.</p>
            </article>
            <article data-demo="roadmap-pilots">
              <span className="story-roadmap-dot" aria-hidden="true" />
              <span className="story-roadmap-stage">THEN · PLANNED PILOTS</span>
              <h3>Scale Through Trusted Channels</h3>
              <p>Pilot with chambers, small-business centres, incubators, and industry associations.</p>
            </article>
            <article className="story-roadmap-north" data-demo="roadmap-north-star">
              <span className="story-roadmap-dot" aria-hidden="true" />
              <span className="story-roadmap-stage">NORTH STAR · LONG-TERM VISION</span>
              <h3>Procurement Readiness for Every Canadian SME</h3>
              <p>Make verified supplier evidence and trusted procurement guidance accessible across sectors and regions.</p>
            </article>
          </div>
          <div className="story-north-star">
            <span>OUR NORTH STAR</span>
            <p data-demo="roadmap-statement">Make public procurement a more accessible growth channel for the Canadian businesses building the country’s future.</p>
          </div>
          <div className="story-final">
            <div>
              <p className="story-eyebrow">SEE THE CURRENT PROTOTYPE</p>
              <h2>More qualified Canadian businesses should be able to compete.</h2>
              <p>BidNorth helps small teams catch avoidable disqualifiers early and invest their time where they are ready to compete.</p>
            </div>
            <div className="story-actions">
              <Link className="story-button story-button-blue" href={sample}>
                See the sample readiness check <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="story-text-link" href="/methodology">
                Explore our methodology <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <footer className="story-footer">
            <span>BidNorth · Built for Canadian businesses</span>
            <span>Documented readiness, not award prediction.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
