import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CityTrainingContent = {
  city: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  highlights: string[];
  relatedLocations: {
    label: string;
    href: string;
  }[];
};

export function CityTrainingPage({ content }: { content: CityTrainingContent }) {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" />
              {content.eyebrow}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">{content.title}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              {content.intro}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

              <Link href="/contact">
                <Button size="lg" variant="outline">Talk to Techwell</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-12 px-4 lg:grid-cols-[1fr_320px]">
          <article className="space-y-10">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4 text-2xl font-bold">{section.heading}</h2>
                <div className="space-y-4 text-base leading-8 text-muted-foreground">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="h-fit rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">What learners receive</h2>
            <ul className="mt-5 space-y-4">
              {content.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container px-4 text-center">
          <h2 className="text-2xl font-bold">IT training across Andhra Pradesh</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {content.relatedLocations.map((location) => (
              <Link
                key={location.href}
                href={location.href}
                className="rounded-full border bg-background px-5 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                {location.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
