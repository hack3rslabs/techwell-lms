import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Optionally redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data: {
        email: string;
        password: string;
        name: string;
        dob?: string;
        qualification?: string;
        college?: string
    }) => api.post('/auth/register', data),
    verifyOtp: (data: { email: string; otp: string }) =>
        api.post('/auth/verify-otp', data),
    resendOtp: (data: { email: string }) =>
        api.post('/auth/resend-otp', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    refresh: () => api.post('/auth/refresh'),
};

// User API
export const userApi = {
    getMe: () => api.get('/users/me'),
    updateMe: (data: { name?: string; phone?: string; avatar?: string }) =>
        api.put('/users/me', data),
    getAdminStats: () => api.get('/admin/stats'),
    getEnrollments: () => api.get('/admin/enrollments'),
    deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const employerApi = {
    getProfile: () => api.get('/employers/profile'),
    updateProfile: (data: unknown) => api.put('/employers/profile', data),
};

export const uploadApi = {
    upload: (formData: FormData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const searchApi = {
    global: (query: string) => api.get('/search', { params: { q: query } })
};

export interface CoursePayload {
    title: string;
    description: string;
    category: string;
    price: number;
    discountPrice?: number;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    courseCode?: string;
    bannerUrl?: string;
    jobRoles?: string[];
    courseType?: 'RECORDED' | 'LIVE' | 'HYBRID';
    hasInterviewPrep?: boolean;
    interviewPrice?: number;
    [key: string]: unknown;
}

// Course API
export const courseApi = {
    getAll: (params?: { category?: string; search?: string; page?: number }) =>
        api.get('/courses', { params }),
    getById: (id: string) => api.get(`/courses/${id}`),
    create: (data: CoursePayload) =>
        api.post('/courses', data),
    update: (id: string, data: Partial<CoursePayload>) =>
        api.put(`/courses/${id}`, data),
    enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
    getMyEnrollments: () => api.get('/courses/my/enrolled'),
    getMyCreated: () => api.get('/courses/my/created'),
    generate: (data: { topic: string; difficulty: string }) => api.post('/courses/generate', data),

    // Learning Features
    getLearnContent: (id: string) => api.get(`/courses/${id}/learn`),
    completeLesson: (courseId: string, lessonId: string) => api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),

    updateCurriculum: (id: string, data: { modules: unknown[] }) => api.put(`/courses/${id}/curriculum`, data),
    delete: (id: string) => api.delete(`/courses/${id}`),
};

// Enrollment Request API
export const enrollmentRequestApi = {
    submit: (data: { courseId: string; name: string; email: string; phone?: string; qualification?: string }) => api.post('/enrollment-requests', data),
    getMyRequest: (courseId: string) => api.get(`/enrollment-requests/my/${courseId}`),
    getAll: () => api.get('/enrollment-requests'),
    updateStatus: (id: string, status: 'APPROVED' | 'REJECTED') => api.put(`/enrollment-requests/${id}/status`, { status }),
};

// Employer Request API
export const employerRequestApi = {
    submit: (data: { name: string; designation: string; email: string; phone?: string }) => api.post('/employer-requests', data),
    getAll: () => api.get('/employer-requests'),
    getById: (id: string) => api.get(`/employer-requests/${id}`),
    approve: (id: string, data?: { adminNotes?: string }) => api.put(`/employer-requests/${id}/approve`, data),
    reject: (id: string, data: { rejectionReason: string }) => api.put(`/employer-requests/${id}/reject`, data),
};

// Interview API
export const interviewApi = {
    getAll: (params?: { status?: string; page?: number }) =>
        api.get('/interviews', { params }),
    getById: (id: string) => api.get(`/interviews/${id}`),
    create: (data: {
        domain: string;
        role: string;
        company?: string;
        difficulty?: string;
        jobDescription?: string;
        panelCount?: number;
        scheduledAt?: string | null;
        duration?: number;
        selectedAvatars?: string[];
        technology?: string;
        resumeUrl?: string;
    }) => api.post('/interviews', data),
    start: (id: string) => api.patch(`/interviews/${id}/start`),
    complete: (id: string, data?: { score?: number }) => api.patch(`/interviews/${id}/complete`, data),
    getStats: () => api.get('/interviews/stats/summary'),
    getJobInterviews: () => api.get('/interviews/job-interviews'),
    getReport: (id: string) => api.get(`/interviews/${id}/report`),
    // AI Features
    nextQuestion: (id: string) => api.post(`/interviews/${id}/next-question`),
    submitResponse: (id: string, data: { questionId: string; answer: string; code?: string }) =>
        api.post(`/interviews/${id}/response`, data),
    trainAI: (data: unknown) => api.post('/interviews/train', data),
};

// Payment API
export const paymentApi = {
    // Send amount (in rupees) and optional currency; backend will create order and return orderId, keyId and amount (in paise)
    createOrder: (courseId: string, type: 'COURSE_ONLY' | 'BUNDLE' | 'INTERVIEW_ONLY' = 'COURSE_ONLY', amount?: number, currency = 'INR') =>
        api.post('/payments/create-order', { courseId, type, amount, currency }),
    // Backend expects fields: razorpay_order_id, razorpay_payment_id, razorpay_signature
    verifyPayment: (data: unknown) => api.post('/payments/verify-payment', data),
    getOrderStatus: (orderId: string) => api.get(`/payments/order-status/${orderId}`),
};

// Certificate API
export const certificateApi = {
    // Certificates
    getAll: () => api.get('/certificates'),
    getById: (id: string) => api.get(`/certificates/${id}`),
    verify: (uniqueId: string) => api.get(`/certificates/verify/${uniqueId}`),
    generate: (data: { userId: string; courseId: string; enrollmentId: string; grade?: string; score?: number }) =>
        api.post('/certificates/generate', data),
    invalidate: (id: string) => api.put(`/certificates/${id}/invalidate`),

    // Settings
    getSettings: () => api.get('/certificates/admin/settings'),
    updateSettings: (data: {
        prefix?: string;
        yearInId?: boolean;
        sequenceDigits?: number;
        defaultSignatureUrl?: string;
        defaultSignatoryName?: string;
        defaultSignatoryTitle?: string;
        defaultValidityMonths?: number | null;
        instituteName?: string;
        instituteLogoUrl?: string;
    }) => api.put('/certificates/admin/settings', data),

    // Templates
    getTemplates: () => api.get('/certificates/admin/templates'),
    createTemplate: (data: { name: string; description?: string; designUrl: string; previewUrl?: string; isDefault?: boolean }) =>
        api.post('/certificates/admin/templates', data),
    updateTemplate: (id: string, data: { name?: string; description?: string; designUrl?: string; previewUrl?: string; isDefault?: boolean; isActive?: boolean }) =>
        api.put(`/certificates/admin/templates/${id}`, data),
    deleteTemplate: (id: string) => api.delete(`/certificates/admin/templates/${id}`),
};

// AI Settings API
export const aiSettingsApi = {
    get: () => api.get('/ai-settings'),
    update: (data: {
        adaptiveDifficulty: boolean;
        escalationThreshold: number;
        initialDifficulty: string;
        maxQuestions: number;
        hrQuestionRatio: number;
    }) => api.put('/ai-settings', data)
};

// Knowledge Base API
export const knowledgeBaseApi = {
    getAll: (params?: { domain?: string; search?: string; difficulty?: string }) =>
        api.get('/knowledge-base', { params }),
    create: (data: {
        domain: string;
        topic: string;
        content: string;
        difficulty: string;
        answer?: string;
    }) => api.post('/knowledge-base', data),
    update: (id: string, data: {
        domain?: string;
        topic?: string;
        content?: string;
        difficulty?: string;
        answer?: string;
    }) => api.put(`/knowledge-base/${id}`, data),
    delete: (id: string) => api.delete(`/knowledge-base/${id}`),
    getStats: () => api.get('/knowledge-base/stats'),
    generate: (data: {
        domain: string;
        role: string;
        company?: string;
        difficulty: string;
        count: number;
    }) => api.post('/ai/generate-questions', data),
    generateFromContext: (data: {
        context: string;
        domain: string;
        role: string;
        difficulty: string;
        count: number;
    }) => api.post('/ai/generate-from-jd', data),
    bulkDelete: (ids: string[]) => api.post('/knowledge-base/bulk-delete', { ids }),
    bulkUpdate: (ids: string[], updates: unknown) => api.post('/knowledge-base/bulk-update', { ids, updates })
};

// ATS API
export const atsApi = {
    applyExternal: (data: unknown) => api.post('/ats/apply/external', data),
    getApplication: (id: string) => api.get(`/ats/applications/detail/${id}`),
    getApplications: (jobId: string, params?: unknown) => api.get(`/ats/applications/${jobId}`, { params }),
    updateStatus: (id: string, data: { status: string; notes?: string }) => api.patch(`/ats/status/${id}`, data),
    addNote: (appId: string, data: { content: string; tags?: string[]; rating?: number }) => api.post(`/ats/notes/${appId}`, data),
    rateCandidate: (appId: string, data: { rating: number; tags?: string[] }) => api.patch(`/ats/rate/${appId}`, data),
    scheduleInterview: (data: unknown) => api.post('/ats/interviews', data),
    submitFeedback: (interviewId: string, data: unknown) => api.patch(`/ats/interviews/${interviewId}/feedback`, data),
    getAnalytics: () => api.get('/ats/analytics'),
    getActivity: (limit?: number) => api.get('/ats/activity', { params: { limit } }),
    bulkStatusUpdate: (data: { applicationIds: string[]; status: string; notes?: string }) => api.post('/ats/bulk-status', data),
    exportApplicants: (jobId: string) => api.get(`/ats/export/${jobId}`, { responseType: 'blob' }),
};

// Avatar API
export const avatarApi = {
    getAll: () => api.get('/avatars'),
    create: (data: unknown) => api.post('/avatars', data),
    update: (id: string, data: unknown) => api.put(`/avatars/${id}`, data),
    delete: (id: string) => api.delete(`/avatars/${id}`),
    toggleActive: (id: string) => api.patch(`/avatars/${id}/toggle`),
};

// Blog API
export const blogApi = {
    getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => api.get('/blogs', { params }),
    getBySlug: (slug: string) => api.get(`/blogs/${slug}`),
    create: (data: unknown) => api.post('/blogs', data),
    update: (id: string, data: unknown) => api.put(`/blogs/${id}`, data),
    delete: (id: string) => api.delete(`/blogs/${id}`),
};

// Support/Ticket API
export const ticketApi = {
    create: (data: FormData) => api.post('/tickets', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getAll: (params?: { status?: string; priority?: string; category?: string }) => api.get('/tickets', { params }),
    getById: (id: string) => api.get(`/tickets/${id}`),
    reply: (id: string, data: FormData) => api.post(`/tickets/${id}/reply`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateStatus: (id: string, data: { status: string; priority?: string }) => api.put(`/tickets/${id}/status`, data),
    assign: (id: string, data: { assignedTo?: string; internalNotes?: string }) => api.patch(`/tickets/${id}/assign`, data),
};

// Lead/CRM API
export const leadApi = {
    getAll: (params?: unknown) => api.get('/leads', { params }),
    getCounts: () => api.get('/leads/counts'),
    create: (data: unknown) => api.post('/leads', data),
    capture: (data: unknown) => api.post('/leads/capture', data),
    markSeen: () => api.post('/leads/mark-seen'),
    update: (id: string, data: unknown) => api.put(`/leads/${id}`, data),
    delete: (id: string) => api.delete(`/leads/${id}`),
    convert: (id: string) => api.post(`/leads/${id}/convert`),
    getAnalytics: (params?: unknown) => api.get('/leads/analytics', { params }),
    import: (formData: FormData) => api.post('/leads/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getIntegrations: () => api.get('/leads/integrations'),
    configureIntegration: (data: unknown) => api.post('/leads/integrations', data),
};

// Task API
export const taskApi = {
    getAll: (params?: { status?: string; priority?: string; assignedTo?: string }) => api.get('/tasks', { params }),
    create: (data: unknown) => api.post('/tasks', data),
    update: (id: string, data: unknown) => api.put(`/tasks/${id}`, data),
    delete: (id: string) => api.delete(`/tasks/${id}`),
    addComment: (id: string, text: string) => api.post(`/tasks/${id}/comments`, { text }),
};

// Live Class API
export const liveClassApi = {
    getAll: (params?: { courseId?: string; upcoming?: boolean }) => api.get('/live-classes', { params }),
    create: (data: unknown) => api.post('/live-classes', data),
    update: (id: string, data: unknown) => api.patch(`/live-classes/${id}`, data),
    delete: (id: string) => api.delete(`/live-classes/${id}`),
};

// Analytics API
export const analyticsApi = {
    getInterviewStats: () => api.get('/analytics/interviews'),
    getBenchmark: () => api.get('/analytics/benchmark'),
};

// Library API
export const libraryApi = {
    trackView: (resourceId: string) => api.patch(`/library/resources/${resourceId}/view`),
    download: (resourceId: string) => api.get(`/library/resources/${resourceId}/download`, { responseType: 'blob' }),
    getBookmarks: () => api.get('/library/bookmarks'),
    toggleBookmark: (resourceId: string) => api.post('/library/bookmarks', { resourceId }),
    getResources: (params?: { category?: string; domain?: string; search?: string }) => api.get('/library/resources', { params }),
    getCategories: () => api.get('/library/categories'),
};

// Students API (Admin)
export const studentsApi = {
    getAll: (params?: { search?: string; course?: string; page?: number; limit?: number }) =>
        api.get('/admin/students', { params }),
};

export const rbacApi = {
    getRoles: () => api.get('/rbac/roles'),
    getPermissions: () => api.get('/rbac/permissions'),
    createRole: (data: { name: string; description?: string; permissions: string[] }) => api.post('/rbac/roles', data),
    updateRole: (id: string, data: { name?: string; description?: string; permissions: string[] }) => api.put(`/rbac/roles/${id}`, data),
    deleteRole: (id: string) => api.delete(`/rbac/roles/${id}`),
    assignRole: (userId: string, roleId: string) => api.post('/rbac/assign', { userId, roleId }),
};

export default api;
