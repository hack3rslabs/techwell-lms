"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock } from "lucide-react";
import OfferDialog from "./OfferDialog";

const STAGES = [
    { id: "APPLIED", title: "New Applicants", color: "border-blue-200 bg-blue-50" },
    { id: "SCREENING", title: "Screening", color: "border-yellow-200 bg-yellow-50" },
    { id: "SHORTLISTED", title: "Shortlisted", color: "border-purple-200 bg-purple-50" },
    { id: "INTERVIEW_SCHEDULED", title: "Interview", color: "border-orange-200 bg-orange-50" },
    { id: "OFFER_RELEASED", title: "Offered", color: "border-emerald-200 bg-emerald-50" },
];

interface Application {
    id: string;
    source: string;
    status: string;
    resumeUrl: string;
    createdAt: string;
    externalName?: string;
    externalEmail?: string;
    externalPhone?: string;
    applicant?: {
        name: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    atsScore?: number;
}

interface PipelineBoardProps {
    applications: Application[];
    onStatusChange: (appId: string, newStatus: string) => void;
}

export default function PipelineBoard({ applications, onStatusChange }: PipelineBoardProps) {
    const [columns, setColumns] = useState<Record<string, Application[]>>({});
    const [offerDialogData, setOfferDialogData] = useState<{ isOpen: boolean; appId: string; candidateName: string } | null>(null);

    useEffect(() => {
        const newCols: Record<string, Application[]> = {};
        STAGES.forEach(stage => {
            newCols[stage.id] = [];
        });
        // Catch all others in applied/screening if not matching exact
        applications.forEach(app => {
            let s = app.status;
            if (!newCols[s]) s = "APPLIED"; // Default bucket
            if (newCols[s]) {
                newCols[s].push(app);
            }
        });
        setColumns(newCols);
    }, [applications]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = [...(columns[source.droppableId] || [])];
        const destCol = [...(columns[destination.droppableId] || [])];
        const [movedApp] = sourceCol.splice(source.index, 1);

        // Update optimistic UI
        if (source.droppableId === destination.droppableId) {
            sourceCol.splice(destination.index, 0, movedApp);
            setColumns({ ...columns, [source.droppableId]: sourceCol });
        } else {
            // Intercept OFFER_RELEASED stage
            if (destination.droppableId === "OFFER_RELEASED") {
                const name = movedApp.source === 'INTERNAL' ? movedApp.applicant?.name : movedApp.externalName;
                setOfferDialogData({
                    isOpen: true,
                    appId: movedApp.id,
                    candidateName: name || 'Candidate',
                });
                return; // We don't apply the optimistic update yet; wait for success
            }

            movedApp.status = destination.droppableId;
            destCol.splice(destination.index, 0, movedApp);
            setColumns({
                ...columns,
                [source.droppableId]: sourceCol,
                [destination.droppableId]: destCol
            });
            // API Call
            onStatusChange(draggableId, destination.droppableId);
        }
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
                {STAGES.map((stage) => (
                    <div key={stage.id} className="min-w-[320px] max-w-[320px] shrink-0 snap-start">
                        <div className={`rounded-xl border ${stage.color} p-4 h-full min-h-[500px] flex flex-col`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-slate-700 tracking-tight">{stage.title}</h3>
                                <Badge variant="secondary" className="bg-white/50 text-slate-600 font-bold">
                                    {columns[stage.id]?.length || 0}
                                </Badge>
                            </div>
                            
                            <Droppable droppableId={stage.id}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    >
                                        {columns[stage.id]?.map((app, index) => {
                                            const name = app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;
                                            const email = app.source === 'INTERNAL' ? app.applicant?.email : app.externalEmail;
                                            
                                            return (
                                                <Draggable key={app.id} draggableId={app.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary/20 scale-105' : ''} transition-all duration-200`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Avatar className="w-10 h-10 border shadow-sm">
                                                                    <AvatarImage src={app.applicant?.avatar} />
                                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">{name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <h4 className="font-bold text-sm text-slate-900 truncate">{name}</h4>
                                                                        {app.atsScore && (
                                                                            <Badge variant="outline" className="text-[10px] font-black border-emerald-200 text-emerald-700 bg-emerald-50 px-1 py-0 h-4">
                                                                                {app.atsScore}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate">
                                                                        <Mail className="w-3 h-3" />
                                                                        <span className="truncate">{email}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                                                            {app.source}
                                                                        </Badge>
                                                                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                ))}
            </div>
            </DragDropContext>
            
            {offerDialogData && (
                <OfferDialog
                    isOpen={offerDialogData.isOpen}
                    onClose={() => setOfferDialogData(null)}
                    applicationId={offerDialogData.appId}
                    jobId={applications[0]?.id || ""} // Note: In a real app we'd pass the actual jobId
                    candidateName={offerDialogData.candidateName}
                    onSuccess={() => {
                        // Refresh data via parent
                        onStatusChange(offerDialogData.appId, "OFFER_RELEASED");
                        setOfferDialogData(null);
                    }}
                />
            )}
        </>
    );
}
