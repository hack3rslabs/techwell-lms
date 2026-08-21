"use client"

import React, { useState, useEffect } from "react"
import { Search, Loader2, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import api from "@/lib/api"

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  order: number
}

const CATEGORIES = [
  "General Information",
  "Training Courses",
  "Jobs",
  "Job Assistance",
  "Placement Assistance",
  "Recruitment",
  "Campus Hiring",
  "Payments",
  "Certificates",
  "Consultancy",
  "Fraud & Safety",
  "Terms & Conditions"
]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faqs')
        setFaqs(res.data.data || [])
      } catch (error) {
        console.error("Error fetching FAQs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group by category for display if "all" is selected
  const groupedFaqs = CATEGORIES.reduce((acc, category) => {
    const catFaqs = filteredFaqs.filter(f => f.category === category)
    if (catFaqs.length > 0) {
      acc[category] = catFaqs
    }
    return acc
  }, {} as Record<string, Faq[]>)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      {/* Header */}
      <div className="bg-sky-600 dark:bg-sky-900 text-white py-16 px-4 mb-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-sky-100 max-w-2xl mx-auto">
            Find simple answers to common questions about our training, jobs, and consultancy services.
          </p>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-full bg-white text-slate-900 focus-visible:ring-offset-0 border-none shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 px-3 uppercase tracking-wider text-sm">
              Categories
            </h3>
            <div className="flex overflow-x-auto md:flex-col pb-4 md:pb-0 gap-2 hide-scrollbar">
              <Button
                variant={selectedCategory === "all" ? "default" : "ghost"}
                className={`justify-start whitespace-nowrap ${selectedCategory === "all" ? "" : "text-slate-600 dark:text-slate-400"}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Questions
              </Button>
              {CATEGORIES.filter(cat => faqs.some(f => f.category === cat)).map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className={`justify-start whitespace-nowrap ${selectedCategory === category ? "" : "text-slate-600 dark:text-slate-400"}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="flex-1 max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-6 md:p-8">
            
            {/* Legal Notice */}
            <div className="flex items-start gap-3 p-4 mb-8 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-200 rounded-xl border border-sky-100 dark:border-sky-900">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p>
                  These FAQs provide basic operational information. For comprehensive legal details, rules, and binding agreements, please refer to our <Link href="/help/terms" className="font-bold underline hover:text-sky-900 dark:hover:text-white">Terms & Conditions</Link>.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg">No questions found matching your search.</p>
                <Button variant="link" onClick={() => {setSearchQuery(""); setSelectedCategory("all")}}>Clear filters</Button>
              </div>
            ) : selectedCategory === "all" ? (
              <div className="space-y-10">
                {Object.entries(groupedFaqs).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{category}</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {items.map(faq => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-slate-200">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{selectedCategory}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map(faq => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-slate-200">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}
