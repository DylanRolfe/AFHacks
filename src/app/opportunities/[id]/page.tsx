import { notFound } from "next/navigation";
import { tenders } from "@/data/tenders";
import { TenderDetail } from "@/components/tender-detail";
export function generateStaticParams() {
  return tenders.map((t) => ({ id: t.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: tenders.find((t) => t.id === id)?.title ?? "Opportunity not found",
  };
}
export default async function TenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sample?: string }>;
}) {
  const sample = (await searchParams).sample === "1";
  const { id } = await params;
  const tender = tenders.find((t) => t.id === id);
  if (!tender) notFound();
  return <TenderDetail tender={tender} sample={sample} />;
}
