"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, MousePointer, Clock, BarChart3 } from 'lucide-react';

// Fix: Ensure we don't have double /api
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const _API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
// Note: The fetches below use /api prefix, so we need to be careful. 
// Actually, looking at the fetches: `${API_URL}/api/behavior...`
// If API_URL already has /api, we get /api/api/behavior.
// So we should STRIP /api from the base if we are going to append /api manually.
const PROPER_API_URL = BASE_URL.replace(/\/api$/, '');

interface IntentDistribution {
    intent: string;
    count: number;
}

interface TopPage {
    page: string;
    count: number;
}

interface CTAPerformance {
    ctaId: string;
    clicks: number;
}

interface PopupStats {
    totalSessions: number;
    popupsShown: number;
    showRate: string;
    responses: Array<{ response: string; count: number }>;
}

interface TimeOnPage {
    page: string;
    avgTime: number;
    visits: number;
}

export default function BehaviorAnalyticsPage() {
    const [intentData, setIntentData] = useState<IntentDistribution[]>([]);
    const [topPages, setTopPages] = useState<TopPage[]>([]);
    const [ctaData, setCTAData] = useState<CTAPerformance[]>([]);
    const [popupStats, setPopupStats] = useState<PopupStats | null>(null);
    const [timeData, setTimeData] = useState<TimeOnPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [intents, pages, ctas, popup, time] = await Promise.all([
                fetch(`${PROPER_API_URL}/api/behavior/analytics/intent-distribution`).then(r => r.json()),
                fetch(`${PROPER_API_URL}/api/behavior/analytics/top-pages?limit=10`).then(r => r.json()),
                fetch(`${PROPER_API_URL}/api/behavior/analytics/cta-performance`).then(r => r.json()),
                fetch(`${PROPER_API_URL}/api/behavior/analytics/popup-stats`).then(r => r.json()),
                fetch(`${PROPER_API_URL}/api/behavior/analytics/time-on-page`).then(r => r.json())
            ]);

            setIntentData(intents);
            setTopPages(pages);
            setCTAData(ctas.slice(0, 10));
            setPopupStats(popup);
            setTimeData(time.slice(0, 10));
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIntentLabel = (intent: string) => {
        const labels: Record<string, string> = {
            'INTERVIEW_FOCUSED': 'Interview Prep',
            'COURSE_FOCUSED': 'Courses',
            'JOB_FOCUSED': 'Jobs',
            'BROWSING': 'Exploring'
        };
        return labels[intent] || intent;
    };

    const getIntentColor = (intent: string) => {
        const colors: Record<string, string> = {
            'INTERVIEW_FOCUSED': 'bg-blue-500',
            'COURSE_FOCUSED': 'bg-purple-500',
            'JOB_FOCUSED': 'bg-green-500',
            'BROWSING': 'bg-orange-500'
        };
        return colors[intent] || 'bg-gray-500';
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const totalIntents = intentData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Brain className="h-8 w-8 text-primary" />
                    AI Behavior Intelligence
                </h1>
                <p className="text-muted-foreground mt-2">
                    User behavior insights and intent analysis
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalIntents}</div>
                        <p className="text-xs text-muted-foreground">Tracked sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Popup Show Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{popupStats?.showRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {popupStats?.popupsShown || 0} of {popupStats?.totalSessions || 0} sessions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topPages.length}</div>
                        <p className="text-xs text-muted-foreground">Pages tracked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {ctaData.reduce((sum, item) => sum + item.clicks, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total CTA interactions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Intent Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Intent Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {intentData.map((item) => {
                            const percentage = totalIntents > 0 ? (item.count / totalIntents * 100).toFixed(1) : 0;
                            return (
                                <div key={item.intent} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{getIntentLabel(item.intent)}</span>
                                        <span className="text-muted-foreground">
                                            {item.count} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getIntentColor(item.intent)} transition-all w-[${percentage}%]`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Visited Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topPages.map((page, index) => (
                                <div key={page.page} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-mono truncate max-w-xs">
                                            {page.page}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold">{page.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* CTA Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>CTA Click Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ctaData.map((cta, index) => (
                                <div key={cta.ctaId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm truncate max-w-xs">{cta.ctaId}</span>
                                    </div>
                                    <span className="text-sm font-semibold">{cta.clicks}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Time on Page */}
                <Card>
                    <CardHeader>
                        <CardTitle>Average Time on Page</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {timeData.map((item, _index) => (
                                <div key={item.page} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-mono truncate max-w-xs">{item.page}</span>
                                        <span className="font-semibold">{formatTime(item.avgTime)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.visits} visits
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popup Responses */}
            {popupStats && popupStats.responses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Popup Response Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {popupStats.responses.map((response) => (
                                <div key={response.response} className="p-4 rounded-lg border bg-muted/50">
                                    <div className="text-2xl font-bold">{response.count}</div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {response.response}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
