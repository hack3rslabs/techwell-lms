import { Metadata } from 'next'
import JobListing from '@/components/jobs/JobListing'

export const metadata: Metadata = {
    title: 'Find Your Next Tech Job | Techwell Career Portal',
    description: 'Explore thousands of tech job opportunities. Filter by role, location, and experience. Get placed with Techwell hiring partners.',
    keywords: ['Tech Jobs India', 'Software Engineer Jobs', 'Data Science Roles', 'Remote Tech Jobs', 'Fresher Jobs 2026'],
    openGraph: {
        title: 'Career Opportunities | Techwell Placement Portal',
        description: 'Connect with top hiring partners and land your dream tech job.',
        type: 'website',
        images: ['/images/jobs-og.png']
    }
}

export default function Page() {
    return <JobListing />
}
