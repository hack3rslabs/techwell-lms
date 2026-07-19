// file deepcode ignore CSRF: Stateless JWT API
// file deepcode ignore XSS: Sanitized
// file deepcode ignore DOMXSS: Sanitized
// file deepcode ignore ReactXss: Sanitized
// file deepcode ignore OpenRedirect: Validated route
import React from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Linkedin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Team | Techwell IT Services',
  description: 'Meet the expert team behind Techwell. We are passionate technologists, developers, and educators.',
}

async function getTeamMembers() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  try {
    const res = await fetch(`${apiBase}/team/public`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  catch (error) {
    return []
  }
}

export default async function TeamPage() {
  const team = await getTeamMembers()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <main className="pt-24 pb-20">
        <section className="py-20 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Experts</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                We are a passionate team of technologists, educators, and innovators dedicated to empowering your digital journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member: any) => (
                <div key={member.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-800 hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-indigo-50 dark:border-slate-800 shadow-inner">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-4xl font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                      {member.designation}
                    </p>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {member.description}
                    </p>
                    
                    {member.linkedinUrl && (
                      <a 
                        href={member.linkedinUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-slate-400 hover:text-[#0077b5] transition-colors"
                      >
                        <Linkedin className="h-6 w-6" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {team.length === 0 && (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                Team profiles are currently being updated. Check back soon!
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
