import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\enrolls\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add imports for modal and inputs
imports_to_add = """import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { courseApi, userApi as userApi2 } from '@/lib/api'
"""

if "import { Dialog" not in content:
    content = content.replace("import { Card, CardContent", imports_to_add + "import { Card, CardContent")

# Add manual enrollment state
state_code = """
    const [isManualModalOpen, setIsManualModalOpen] = React.useState(false)
    const [manualForm, setManualForm] = React.useState({
        userId: '',
        courseId: '',
        batchId: '',
        couponCode: '',
        paymentMethod: 'CASH',
        amountPaid: ''
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    
    // Dropdown options
    const [courses, setCourses] = React.useState<any[]>([])

    React.useEffect(() => {
        if (isManualModalOpen) {
            courseApi.getAll().then(res => setCourses(res.data)).catch(console.error)
        }
    }, [isManualModalOpen])

    const handleManualEnrollment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const { default: api } = await import('@/lib/api')
            await api.post('/admin/enrollments/manual', manualForm)
            setIsManualModalOpen(false)
            fetchEnrollments()
            setManualForm({
                userId: '',
                courseId: '',
                batchId: '',
                couponCode: '',
                paymentMethod: 'CASH',
                amountPaid: ''
            })
            alert('Student enrolled successfully!')
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to enroll student')
        } finally {
            setIsSubmitting(false)
        }
    }
"""

if "const [isManualModalOpen" not in content:
    content = content.replace("const [isLoading, setIsLoading] = React.useState(true)", "const [isLoading, setIsLoading] = React.useState(true)" + state_code)

# Add the New Enrollment Button in the header
button_code = """
                    <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <GraduationCap className="h-4 w-4" />
                                New Enrollment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleManualEnrollment}>
                                <DialogHeader>
                                    <DialogTitle>Manual Student Enrollment</DialogTitle>
                                    <DialogDescription>
                                        Enroll an existing student into a course and collect cash or online payment.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="userId">Student User ID</Label>
                                        <Input
                                            id="userId"
                                            placeholder="Enter User ID (cuid)"
                                            value={manualForm.userId}
                                            onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="course">Course</Label>
                                        <Select onValueChange={(v) => setManualForm({ ...manualForm, courseId: v })} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="paymentMethod">Payment Method</Label>
                                        <Select value={manualForm.paymentMethod} onValueChange={(v) => setManualForm({ ...manualForm, paymentMethod: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash (Collected by Admin/Staff)</SelectItem>
                                                <SelectItem value="ONLINE">Online (Paid via other means)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="couponCode">Coupon / Promo Code (Optional)</Label>
                                        <Input
                                            id="couponCode"
                                            placeholder="e.g. SUMMER50"
                                            value={manualForm.couponCode}
                                            onChange={(e) => setManualForm({ ...manualForm, couponCode: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amountPaid">Override Amount Paid (Optional)</Label>
                                        <Input
                                            id="amountPaid"
                                            type="number"
                                            placeholder="Leave empty to auto-calculate"
                                            value={manualForm.amountPaid}
                                            onChange={(e) => setManualForm({ ...manualForm, amountPaid: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Enroll Student
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
"""

if "New Enrollment" not in content:
    # insert before Refresh button
    content = content.replace('<Button variant="outline" onClick={fetchEnrollments} className="gap-2">', button_code + '\n                <Button variant="outline" onClick={fetchEnrollments} className="gap-2">')


with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\enrolls\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated enrolls page!")
