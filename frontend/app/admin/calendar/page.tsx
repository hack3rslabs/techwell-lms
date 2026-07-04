"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Briefcase } from "lucide-react"

export default function PlacementCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState([
        { id: 1, date: new Date(), title: 'Google Campus Drive', type: 'drive', time: '10:00 AM' },
        { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 2)), title: 'Microsoft Interviews', type: 'interview', time: '09:00 AM' },
        { id: 3, date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Amazon Pre-Placement Talk', type: 'talk', time: '02:00 PM' }
    ])

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
    }

    // A very simple static calendar view for demo purposes
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    
    const renderCalendarDays = () => {
        const days = []
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/50"></div>)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            const dayEvents = events.filter(e => 
                e.date.getDate() === i && 
                e.date.getMonth() === currentDate.getMonth() && 
                e.date.getFullYear() === currentDate.getFullYear()
            )
            
            days.push(
                <div key={i} className="h-24 border border-gray-100 p-1 overflow-y-auto hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-xs text-gray-500 mb-1 px-1">{i}</div>
                    {dayEvents.map(ev => (
                        <div key={ev.id} className={`text-[10px] p-1 mb-1 rounded-sm font-medium truncate
                            ${ev.type === 'drive' ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500' :
                              ev.type === 'interview' ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500' :
                              'bg-green-100 text-green-800 border-l-2 border-green-500'}`}>
                            {ev.time} - {ev.title}
                        </div>
                    ))}
                </div>
            )
        }
        return days
    }

    return (
        <div className="container space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-8 w-8 text-indigo-600" />
                        Placement Calendar
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Schedule of all upcoming campus drives and interviews.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={prevMonth} className="px-2">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-lg min-w-[140px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="outline" onClick={nextMonth} className="px-2">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {renderCalendarDays()}
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex gap-4 items-center justify-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Campus Drive</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Interviews</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Pre-Placement Talk</div>
            </div>
        </div>
    )
}
