import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const locations = [
  {
    name: "Visakhapatnam",
    label: "IT Training in Vizag",
    href: "/it-training-vizag",
  },
  {
    name: "Vijayawada",
    label: "Computer Courses in Vijayawada",
    href: "/computer-courses-vijayawada",
  },
  {
    name: "Guntur",
    label: "Software Training in Guntur",
    href: "/software-training-guntur",
  },
];

export function RegionalTrainingSection() {
  return (
    <section className="border-y bg-background py-16" aria-labelledby="andhra-pradesh-training">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Learn from anywhere in AP
          </p>
          <h2 id="andhra-pradesh-training" className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            Why Techwell Is a Leading Computer Training Center in Andhra Pradesh
          </h2>
          <p className="text-lg leading-8 text-muted-foreground">
            Techwell provides AI-powered IT training for students across Visakhapatnam,
            Vijayawada, Guntur, Tirupati, Nellore, Srikakulam and other parts of Andhra
            Pradesh. Our government-recognized learning ecosystem combines computer
            courses, software development training, cybersecurity, final-year projects,
            AI interview practice and placement support to help bridge the gap between
            academic learning and current industry requirements.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.href}
              href={location.href}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <MapPin className="mb-4 h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold">{location.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore online training and career support for learners in {location.name}.
              </p>
              <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
                View local courses
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
