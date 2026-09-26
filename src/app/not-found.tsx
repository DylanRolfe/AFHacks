import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1>This opportunity isn’t in your workspace.</h1>
      <p>Return to the curated list to find your next fit.</p>
      <Link className="button primary" href="/opportunities">
        Browse opportunities
      </Link>
    </div>
  );
}
