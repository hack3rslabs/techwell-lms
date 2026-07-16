"use client";

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { teamApi, settingsApi } from '@/lib/api';

export function TeamSection() {
    const [team, setTeam] = useState<any[]>([]);
    const [showOurTeam, setShowOurTeam] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [settingsRes, teamRes] = await Promise.all([
                    settingsApi.getPublic().catch(() => ({ data: { showOurTeam: false } })),
                    teamApi.getPublic().catch(() => ({ data: [] }))
                ]);
                
                setShowOurTeam(settingsRes.data?.showOurTeam || false);
                setTeam(teamRes.data || []);
            } catch (error) {
                console.error("Failed to load team data", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) return null;
    if (!showOurTeam || team.length === 0) return null;

    return (
        <section className="py-20 bg-muted/10">
            <div className="container">
                <h2 className="text-3xl font-bold text-center mb-12">Meet Our Expert Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {team.map((member) => (
                        <div key={member.id} className="text-center bg-card p-6 rounded-2xl border hover:shadow-xl transition-all duration-300">
                            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-background shadow-md">
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="h-12 w-12 text-primary/50" />
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                            <p className="text-sm text-primary font-medium mb-3">{member.designation}</p>
                            {member.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {member.description}
                                </p>
                            )}
                            {member.linkedinUrl && (
                                <a 
                                    href={member.linkedinUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                                >
                                    LinkedIn Profile
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
