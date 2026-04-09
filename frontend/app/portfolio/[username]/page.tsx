"use client"

import * as React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Award,
    Video,
    BookOpen,
    Share2,
    Linkedin,
    Twitter,
    Link2,
    Download,
    ExternalLink,
    CheckCircle,
    Star,
    Calendar,
    Copy
} from 'lucide-react'
import api from '@/lib/api'

interface PortfolioData {
    user: {
        id: string
        name: string
        headline?: string
        avatarUrl?: string
        linkedinUrl?: string
        portfolioPublic: boolean
    }
    certificates: {
        id: string
        uniqueId: string
        courseName: string
        courseCategory?: string
        issueDate: string
        grade?: string
        isPublic: boolean
    }[]
    interviewAchievements: {
        id: string
        domain: string
        role: string
        score: number
        completedAt: string
        isPublic: boolean
    }[]
    stats: {
        totalCertificates: number
        totalInterviews: number
        averageScore: number
    }
}

export default function PublicPortfolioPage() {
    const params = useParams()
    const username = params.username as string

    const [portfolio, setPortfolio] = React.useState<PortfolioData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [_error, setError] = React.useState<string | null>(null)
    const [copiedLink, setCopiedLink] = React.useState(false)

    React.useEffect(() => {
        fetchPortfolio()
    }, [username])

    const fetchPortfolio = async () => {
        try {
            const res = await api.get(`/portfolio/${username}`)
            setPortfolio(res.data)
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } }
            setError(error.response?.status === 404 ? 'Portfolio not found' : 'Failed to load portfolio')
            // Mock data for demo
            setPortfolio({
                user: {
                    id: '1',
                    name: 'John Doe',
                    headline: 'Full Stack Developer | React | Node.js',
                    portfolioPublic: true
                },
                certificates: [
                    { id: '1', uniqueId: 'CERT-2026-00001', courseName: 'Advanced JavaScript', courseCategory: 'Development', issueDate: '2026-01-15', grade: 'A', isPublic: true },
                    { id: '2', uniqueId: 'CERT-2026-00002', courseName: 'React Masterclass', courseCategory: 'Development', issueDate: '2026-01-20', grade: 'A+', isPublic: true }
                ],
                interviewAchievements: [
                    { id: '1', domain: 'Frontend', role: 'Senior React Developer', score: 92, completedAt: '2026-01-25', isPublic: true },
                    { id: '2', domain: 'Backend', role: 'Node.js Developer', score: 88, completedAt: '2026-01-28', isPublic: true }
                ],
                stats: { totalCertificates: 2, totalInterviews: 2, averageScore: 90 }
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getPortfolioUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/portfolio/${username}`
        }
        return ''
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(getPortfolioUrl())
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(getPortfolioUrl())
        const _title = encodeURIComponent(`Check out my TechWell Portfolio`)
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
    }

    const handleShareTwitter = () => {
        const url = encodeURIComponent(getPortfolioUrl())
        const text = encodeURIComponent(`Check out my professional portfolio with certificates and interview achievements! 🎓`)
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
    }

    const handleShareCertificateLinkedIn = (cert: PortfolioData['certificates'][0]) => {
        const certUrl = encodeURIComponent(`${getPortfolioUrl()}/certificate/${cert.uniqueId}`)
        const _title = encodeURIComponent(`Certificate: ${cert.courseName}`)
        window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courseName)}&organizationName=TechWell&issueYear=2026&issueMonth=1&certUrl=${certUrl}&certId=${cert.uniqueId}`, '_blank')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!portfolio) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
                <p className="text-muted-foreground">This portfolio doesn&apos;t exist or is private.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background pt-12 pb-20">
                <div className="container max-w-4xl">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white">
                            {portfolio.user.name.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold">{portfolio.user.name}</h1>
                            {portfolio.user.headline && (
                                <p className="text-muted-foreground mt-1">{portfolio.user.headline}</p>
                            )}
                        </div>

                        {/* Share Buttons */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyLink}>
                                {copiedLink ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copiedLink ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleShareLinkedIn} title="Share on LinkedIn">
                                <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleShareTwitter} title="Share on Twitter">
                                <Twitter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <Card className="bg-white/50 backdrop-blur">
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold text-primary">{portfolio.stats.totalCertificates}</p>
                                <p className="text-sm text-muted-foreground">Certificates</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/50 backdrop-blur">
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold text-green-600">{portfolio.stats.totalInterviews}</p>
                                <p className="text-sm text-muted-foreground">AI Interviews</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/50 backdrop-blur">
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold text-orange-600">{portfolio.stats.averageScore}%</p>
                                <p className="text-sm text-muted-foreground">Avg Score</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-4xl -mt-8 pb-12">
                {/* Certificates */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Certificates
                        </CardTitle>
                        <CardDescription>Verified course completion certificates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {portfolio.certificates.length > 0 ? (
                            <div className="space-y-4">
                                {portfolio.certificates.map(cert => (
                                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Award className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{cert.courseName}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(cert.issueDate).toLocaleDateString()}
                                                    {cert.grade && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge variant="secondary">Grade: {cert.grade}</Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(`/verify/${cert.uniqueId}`, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                Verify
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleShareCertificateLinkedIn(cert)}
                                            >
                                                <Linkedin className="h-4 w-4 mr-1" />
                                                Add to LinkedIn
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No certificates yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Interview Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-green-600" />
                            AI Interview Achievements
                        </CardTitle>
                        <CardDescription>Performance in AI-powered mock interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {portfolio.interviewAchievements.length > 0 ? (
                            <div className="space-y-4">
                                {portfolio.interviewAchievements.map(interview => (
                                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${interview.score >= 90 ? 'bg-green-100 text-green-600' :
                                                interview.score >= 70 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                <span className="font-bold">{interview.score}%</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{interview.role}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">{interview.domain}</Badge>
                                                    <span>•</span>
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(interview.completedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {interview.score >= 85 && (
                                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Top Performer
                                                </Badge>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const url = encodeURIComponent(`${getPortfolioUrl()}/interview/${interview.id}`)
                                                    const _text = encodeURIComponent(`I scored ${interview.score}% in a ${interview.role} AI Interview! 🎯`)
                                                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
                                                }}
                                            >
                                                <Share2 className="h-4 w-4 mr-1" />
                                                Share
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No interview achievements yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Add to Resume */}
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Add to Your Resume
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Share your verified achievements by adding this portfolio link to your resume or LinkedIn profile.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                        <code className="flex-1 text-sm text-primary">{getPortfolioUrl()}</code>
                        <Button size="sm" onClick={handleCopyLink}>
                            {copiedLink ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
