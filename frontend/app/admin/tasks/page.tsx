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
import {
    CheckSquare, Plus, Calendar, Clock, AlertCircle, CheckCircle2, User, Trash2, MessageSquare, Send
} from 'lucide-react'
import api from '@/lib/api'
import { format } from 'date-fns'
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
    _count?: { comments: number }
}

export default function TaskManagerPage() {
    const [tasks, setTasks] = React.useState<Task[]>([])
    interface TaskUser {
        id: string
        name: string
    }
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
        assignedTo: ''
    })

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users?role=ADMIN,INSTRUCTOR,STAFF') // Assuming filter exists or returns all
            ])
            setTasks(tasksRes.data || [])
            setUsers(usersRes.data.users || usersRes.data || [])
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTask = async () => {
        try {
            await api.post('/tasks', newTask)
            setIsAddOpen(false)
            fetchData()
            setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', status: 'PENDING', assignedTo: '' })
            toast.success('Task created')
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
        } catch (_error) {
            fetchData()
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

            // Update local state
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
        const columnTasks = tasks.filter(t => t.status === status)

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
                    <div className="space-y-3 pr-4">
                        {columnTasks.map(task => (
                            <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(task)}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                            {task.priority}
                                        </Badge>
                                        <div className="flex gap-1">
                                            {task.assignee && (
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={task.assignee.avatar} />
                                                    <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-sm leading-none mb-1">{task.title}</h4>
                                        {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3">
                                            {task.dueDate && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-1" />
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
                                            className="h-6 text-xs"
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

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
                    <p className="text-muted-foreground">Organize your team&apos;s workflow and priorities.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Task Title</label>
                                <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Follow up with leads" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            </div>
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
                                    <label className="text-sm font-medium">Assign To</label>
                                    <Select value={newTask.assignedTo} onValueChange={v => setNewTask({ ...newTask, assignedTo: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                                        <SelectContent>
                                            {users.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                <KanbanColumn status="PENDING" title="To Do" icon={AlertCircle} />
                <KanbanColumn status="IN_PROGRESS" title="In Progress" icon={Clock} />
                <KanbanColumn status="COMPLETED" title="Completed" icon={CheckCircle2} />
            </div>

            {/* Task Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex justify-between items-start pr-8">
                            <DialogTitle className="text-xl">{selectedTask?.title}</DialogTitle>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{selectedTask?.priority}</Badge>
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Assigned to: {selectedTask?.assignee?.name || 'Unassigned'}
                            </span>
                            {selectedTask?.dueDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}
                                </span>
                            )}
                        </div>

                        <div className="text-sm bg-muted/30 p-4 rounded-lg">
                            {selectedTask?.description || 'No description provided.'}
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments
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

                    <div className="pt-4 border-t flex gap-2">
                        <Input
                            placeholder="Write a comment..."
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
