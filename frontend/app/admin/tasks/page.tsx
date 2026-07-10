"use client"

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    CheckSquare, Plus, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, User, Trash2, MessageSquare, Send, Target, Award
} from 'lucide-react'
import api from '@/lib/api'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isPast, addDays, getDay, isToday } from 'date-fns'
import { toast } from 'sonner'

interface Comment {
    id: string
    content: string
    createdAt: string
    user?: {
        name: string
        avatar?: string
    }
}

interface Task {
    id: string
    title: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    dueDate?: string
    assignedTo?: string
    assignee?: { id: string, name: string, avatar?: string }
    comments?: Comment[]
    goalType?: string
    achievedValue?: number
    targetValue?: number
}

interface TaskUser {
    id: string
    name: string
    avatar?: string
}

export default function TaskManagerPage() {
    const [tasks, setTasks] = React.useState<Task[]>([])
    const [users, setUsers] = React.useState<TaskUser[]>([])
    const [_isLoading, setIsLoading] = React.useState(true)
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
    const [detailOpen, setDetailOpen] = React.useState(false)
    const [commentText, setCommentText] = React.useState('')

    // New Task Form
    const [newTask, setNewTask] = React.useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        status: 'PENDING',
        assignedTo: '',
        goalType: '',
        targetValue: ''
    })

    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users?role=ADMIN,INSTRUCTOR,STAFF,SUPER_ADMIN')
            ])
            setTasks(tasksRes.data || [])
            setUsers(usersRes.data.users || usersRes.data || [])
        } catch {
            toast.error("Failed to load tasks data.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTask = async () => {
        try {
            const payload = {
                ...newTask,
                targetValue: newTask.targetValue ? parseFloat(newTask.targetValue) : undefined,
                achievedValue: 0
            }
            await api.post('/tasks', payload)
            setIsAddOpen(false)
            fetchData()
            setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', status: 'PENDING', assignedTo: '', goalType: '', targetValue: '' })
            toast.success('Task/Goal created')
        } catch (_error) {
            toast.error('Failed to add task')
        }
    }

    const handleUpdateStatus = async (id: string, currentStatus: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const nextStatus =
            currentStatus === 'PENDING' ? 'IN_PROGRESS' :
                currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING'

        try {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus as Task['status'] } : t))
            await api.put(`/tasks/${id}`, { status: nextStatus })
            if (nextStatus === 'COMPLETED') {
                toast.success('Task marked as completed! Great job.')
            }
        } catch (_error) {
            fetchData()
        }
    }

    const handleUpdateProgress = async (id: string, currentAchieved: number, target: number) => {
        if (currentAchieved >= target) return;
        try {
            const newAchieved = currentAchieved + 1;
            const isCompleted = newAchieved >= target;
            await api.put(`/tasks/${id}`, { 
                status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS' 
            })
            // Quick local state update for achieved value simulation since API doesn't fully support it yet unless updated.
            setTasks(prev => prev.map(t => t.id === id ? { ...t, achievedValue: newAchieved, status: isCompleted ? 'COMPLETED' : t.status } : t))
            toast.success('Progress updated!')
        } catch {
            toast.error('Failed to update progress')
        }
    }

    const handleDeleteTask = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!confirm('Delete this task?')) return
        try {
            await api.delete(`/tasks/${id}`)
            setTasks(prev => prev.filter(t => t.id !== id))
            if (selectedTask?.id === id) setDetailOpen(false)
            toast.success('Task deleted')
        } catch (_error) {
            toast.error('Failed to delete task')
        }
    }

    const handleAddComment = async () => {
        if (!selectedTask || !commentText.trim()) return
        try {
            const res = await api.post(`/tasks/${selectedTask.id}/comments`, { text: commentText })
            const newComment = res.data

            const updatedTask = {
                ...selectedTask,
                comments: [newComment, ...(selectedTask.comments || [])]
            }
            setSelectedTask(updatedTask)
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t))
            setCommentText('')
        } catch {
            toast.error('Failed to post comment')
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700 border-red-200'
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const openDetail = (task: Task) => {
        setSelectedTask(task)
        setDetailOpen(true)
    }

    const KanbanColumn = ({ status, title, icon: Icon }: { status: string, title: string, icon: React.ElementType }) => {
        const columnTasks = tasks.filter(t => t.status === status && !t.goalType)

        return (
            <div className="flex flex-col h-full bg-muted/30 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {title}
                    </h3>
                    <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4 pb-4">
                        {columnTasks.map(task => (
                            <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group" onClick={() => openDetail(task)}>
                                {task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                                )}
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                            {task.priority}
                                        </Badge>
                                        {task.assignee && (
                                            <Avatar className="h-6 w-6" title={task.assignee.name}>
                                                <AvatarImage src={task.assignee.avatar} />
                                                <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-sm leading-none mb-1">{task.title}</h4>
                                        {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-muted">
                                        <div className="flex items-center gap-3">
                                            {task.dueDate && (
                                                <div className={`flex items-center text-xs ${isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    {format(new Date(task.dueDate), 'MMM d')}
                                                </div>
                                            )}
                                            {(task.comments?.length || 0) > 0 && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <MessageSquare className="h-3 w-3 mr-1" />
                                                    {task.comments?.length}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={status === 'COMPLETED' ? 'outline' : 'default'}
                                            className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => handleUpdateStatus(task.id, status, e)}
                                        >
                                            {status === 'PENDING' ? 'Start' : status === 'IN_PROGRESS' ? 'Complete' : 'Reopen'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = addDays(monthStart, -getDay(monthStart)) // Start from Sunday
        const endDate = addDays(monthEnd, 6 - getDay(monthEnd)) // End on Saturday
        const days = eachDayOfInterval({ start: startDate, end: endDate })

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        return (
            <div className="bg-background rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addDays(monthStart, -1))}>Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addDays(monthEnd, 1))}>Next</Button>
                    </div>
                </div>
                <div className="grid grid-cols-7 border-b bg-muted/20">
                    {weekDays.map(day => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                    {days.map((day, idx) => {
                        const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day))
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                        return (
                            <div key={idx} className={`border-b border-r p-2 min-h-[100px] ${!isCurrentMonth ? 'bg-muted/10 opacity-50' : ''} ${isToday(day) ? 'bg-blue-50/50' : ''}`}>
                                <div className={`text-xs font-semibold mb-1 ${isToday(day) ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                    {dayTasks.map(t => (
                                        <div key={t.id} onClick={() => openDetail(t)} className={`text-[10px] truncate p-1 rounded cursor-pointer ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-700 line-through' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                                            {t.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderTeamGoals = () => {
        const goals = tasks.filter(t => t.goalType && t.targetValue)
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = Math.min(100, Math.round(((goal.achievedValue || 0) / (goal.targetValue || 1)) * 100))
                        const isComplete = progress >= 100
                        
                        return (
                            <Card key={goal.id} className={`relative overflow-hidden ${isComplete ? 'border-green-200 bg-green-50/30' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Target className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-primary'}`} />
                                                <h3 className="font-semibold text-lg">{goal.title}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{goal.goalType}</p>
                                        </div>
                                        {goal.assignee && (
                                            <Avatar className="h-8 w-8 ring-2 ring-background">
                                                <AvatarImage src={goal.assignee.avatar} />
                                                <AvatarFallback>{goal.assignee.name[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{goal.achievedValue || 0} / {goal.targetValue}</span>
                                            <span className={isComplete ? 'text-green-600' : 'text-primary'}>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className={`h-2 ${isComplete ? 'bg-green-100 [&>div]:bg-green-500' : ''}`} />
                                    </div>

                                    {goal.description && (
                                        <p className="mt-4 text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                                    )}

                                    {!isComplete && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full mt-4" 
                                            onClick={() => handleUpdateProgress(goal.id, goal.achievedValue || 0, goal.targetValue || 1)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Progress
                                        </Button>
                                    )}
                                    {isComplete && (
                                        <div className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-green-600 font-medium py-1.5 bg-green-100/50 rounded-md">
                                            <Award className="h-4 w-4" />
                                            Goal Achieved!
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                    {goals.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No active team goals. Create one to motivate your staff!</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const dueSoonCount = tasks.filter(t => t.dueDate && isPast(addDays(new Date(), -1)) && t.status !== 'COMPLETED').length

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task & Goal Manager</h1>
                    <p className="text-muted-foreground">Organize workflow, view schedules, and track team motivations.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {dueSoonCount > 0 && (
                        <Badge variant="destructive" className="h-9 px-3 text-sm rounded-md shadow-sm">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {dueSoonCount} Overdue/Soon
                        </Badge>
                    )}
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" />
                                New Task / Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Create New Task or Goal</DialogTitle>
                            </DialogHeader>
                            <Tabs defaultValue="task" className="w-full mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="task">Standard Task</TabsTrigger>
                                    <TabsTrigger value="goal">Team Goal</TabsTrigger>
                                </TabsList>
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Follow up with 10 leads" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description (Optional)</label>
                                        <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign To</label>
                                        <Select value={newTask.assignedTo} onValueChange={v => setNewTask({ ...newTask, assignedTo: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Staff Member" /></SelectTrigger>
                                            <SelectContent>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <TabsContent value="task" className="space-y-4 mt-4 border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Priority</label>
                                            <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Due Date</label>
                                            <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                                        </div>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="goal" className="space-y-4 mt-4 border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Goal Metric Label</label>
                                            <Input value={newTask.goalType} onChange={e => setNewTask({ ...newTask, goalType: e.target.value })} placeholder="e.g. Sales, Leads, Projects" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Target Amount</label>
                                            <Input type="number" value={newTask.targetValue} onChange={e => setNewTask({ ...newTask, targetValue: e.target.value })} placeholder="e.g. 10" />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            
                            <DialogFooter className="mt-6">
                                <Button onClick={handleAddTask} className="w-full">Save Creation</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto pb-px bg-transparent space-x-6">
                    <TabsTrigger value="board" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
                        Kanban Board
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
                        Calendar Schedule
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
                        Staff Motivation & Goals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="flex-1 mt-6 m-0 h-full">
                    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KanbanColumn status="PENDING" title="To Do" icon={AlertCircle} />
                        <KanbanColumn status="IN_PROGRESS" title="In Progress" icon={Clock} />
                        <KanbanColumn status="COMPLETED" title="Completed" icon={CheckCircle2} />
                    </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="flex-1 mt-6 m-0 h-full">
                    {renderCalendar()}
                </TabsContent>
                
                <TabsContent value="goals" className="flex-1 mt-6 m-0 h-full overflow-y-auto">
                    {renderTeamGoals()}
                </TabsContent>
            </Tabs>

            {/* Task Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex justify-between items-start pr-8">
                            <div>
                                <DialogTitle className="text-xl">{selectedTask?.title}</DialogTitle>
                                {selectedTask?.goalType && (
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                        Goal: {selectedTask.goalType} ({selectedTask.achievedValue} / {selectedTask.targetValue})
                                    </Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                            {!selectedTask?.goalType && <Badge variant="outline">{selectedTask?.priority}</Badge>}
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Assigned to: {selectedTask?.assignee?.name || 'Unassigned'}
                            </span>
                            {selectedTask?.dueDate && (
                                <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    Due: {format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}
                                </span>
                            )}
                        </div>

                        {selectedTask?.description && (
                            <div className="text-sm bg-muted/30 p-4 rounded-lg">
                                {selectedTask.description}
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments & Notes
                            </h3>

                            <div className="space-y-4 mb-4">
                                {selectedTask?.comments && selectedTask.comments.length > 0 ? (
                                    selectedTask.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3 text-sm">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={comment.user?.avatar} />
                                                <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{comment.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex gap-2 shrink-0 bg-background pb-2">
                        <Input
                            placeholder="Write an update..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
