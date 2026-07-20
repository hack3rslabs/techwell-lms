import Image from "next/image"
import { Building2, Quote, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const stories = [
  {
    id: 1,
    name: "Aisha Sharma",
    role: "SDE-1",
    company: "Microsoft",
    image: "https://i.pravatar.cc/150?u=aisha",
    quote: "The intensive Full-Stack bootcamp at Techwell completely transformed my career trajectory. The mock interviews and placement drive access were exactly what I needed to land my dream job at Microsoft.",
    techStack: ["React", "Node.js", "Azure"],
    color: "from-slate-300/30 to-slate-500/20"
  },
  {
    id: 2,
    name: "Rohan Patel",
    role: "Cyber Security Analyst",
    company: "Palo Alto Networks",
    image: "https://i.pravatar.cc/150?u=rohan",
    quote: "Techwell's Cyber Security RTraining program gave me hands-on experience with real-world enterprise architectures. The direct corporate referrals they provided were a game-changer for my career.",
    techStack: ["PenTesting", "Network Sec", "Python"],
    color: "from-gray-300/30 to-gray-500/20"
  },
  {
    id: 3,
    name: "Priya Desai",
    role: "Senior Product Manager",
    company: "Atlassian",
    image: "https://i.pravatar.cc/150?u=priya",
    quote: "I transitioned from a non-tech background into Product Management seamlessly. Techwell's dedicated career coach and AI resume builder helped me showcase my transferable skills perfectly.",
    techStack: ["Agile", "Jira", "Strategy"],
    color: "from-zinc-300/30 to-zinc-500/20"
  }
]

export function SuccessStories() {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-black">
      {/* Background glow effects - Grayscale */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-slate-300/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-zinc-300/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none font-bold tracking-widest uppercase mb-4 hover:bg-slate-300 dark:hover:bg-slate-700">Alumni Outcomes</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black dark:text-white mb-6">
            From Classroom to <span className="text-black dark:text-white">Boardroom</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Join thousands of Techwell alumni who have successfully launched and accelerated their careers at top Fortune 500 tech companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="group relative bg-black dark:bg-white backdrop-blur-xl border border-slate-800 dark:border-slate-200 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl"
            >
              {/* Card gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${story.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10`}></div>
              
              <Quote className="w-10 h-10 text-white/20 dark:text-black/20 absolute top-8 right-8" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 dark:border-black/20 shadow-md group-hover:scale-105 transition-transform duration-500">
                  <Image 
                    src={story.image} 
                    alt={story.name} 
                    fill 
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white dark:text-black">{story.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-300 dark:text-slate-600">
                    <Building2 className="w-3.5 h-3.5" />
                    {story.role} at {story.company}
                  </div>
                </div>
              </div>

              <p className="text-slate-300 dark:text-slate-700 mb-8 leading-relaxed relative z-10 italic font-medium">
                "{story.quote}"
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {story.techStack.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs font-bold px-3 py-1 bg-white/10 dark:bg-black/5 text-white dark:text-black rounded-full border border-white/20 dark:border-black/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a href="/placements" className="inline-flex items-center gap-2 text-black dark:text-white font-bold hover:gap-4 transition-all group">
            View All Placement Records 
            <ArrowRight className="w-5 h-5 group-hover:text-slate-500 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  )
}
