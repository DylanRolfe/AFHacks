import { MethodologyContent } from "@/components/methodology";
import { PageHeader } from "@/components/ui";
export const metadata = { title: "Sources & methodology" };
export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="TRANSPARENT BY DESIGN"
        title="Know what’s behind the recommendation."
        description="Clear inputs. Explainable scores. Your judgment stays in charge."
      />
      <section className="panel methodology-page">
        <MethodologyContent />
      </section>
    </>
  );
}
