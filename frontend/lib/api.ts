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
            // Token expired or invalid, or session expired from another device
            if (typeof window !== 'undefined') {
                if (error.response?.data?.isSessionExpired) {
                    alert('Session expired. You logged in from another device.');
                }
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
        phone?: string;
        dob?: string;
        qualification?: string;
        college?: string;
        referredByCode?: string;
    }) => api.post('/auth/register', data),
    verifyOtp: (data: { email: string; otp: string }) =>
        api.post('/auth/verify-otp', data),
    resendOtp: (data: { email: string }) =>
        api.post('/auth/resend-otp', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    refresh: () => api.post('/auth/refresh'),
    setup2FA: () => api.post('/auth/2fa/setup'),
    enable2FA: (data: { code: string }) => api.post('/auth/2fa/enable', data),
    disable2FA: () => api.post('/auth/2fa/disable'),
    verify2FA: (data: { code: string; tempToken: string; trustDevice?: boolean }) => api.post('/auth/2fa/verify', data),
};

export const consultancyApi = {
    // Public Endpoints
    verifyInvitation: (token: string) => api.get(`/consultancy/public/invite/${token}`),
    submitAgreement: (token: string, data: any) => api.post(`/consultancy/public/invite/${token}/submit`, data),
    
    // Admin Endpoints
    getDashboardStats: () => api.get('/consultancy/dashboard'),
    getInvitations: (status?: string) => api.get('/consultancy/invitations', { params: { status } }),
    createInvitation: (data: { name: string, email: string, phone?: string, customTerms?: string, jobRole?: string, feePercentage?: string }) => api.post('/consultancy/invitations', data),
    updateInvitation: (id: string, data: { name: string, email: string, phone?: string, customTerms?: string, jobRole?: string, feePercentage?: string }) => api.put(`/consultancy/invitations/${id}`, data),
    updateCandidateStatus: (id: string, status: string) => api.patch(`/consultancy/candidates/${id}/status`, { status })
}

// User API
export const userApi = {
    getMe: () => api.get('/users/me'),
    updateMe: (data: { name?: string; phone?: string; avatar?: string }) =>
        api.put('/users/me', data),
    getAdminStats: () => api.get('/admin/stats'),
    getEnrollments: () => api.get('/admin/enrollments'),
    deleteUser: (id: string) => api.delete(`/users/${id}`),
    updatePermissions: (id: string, data: { role: string; isActive: boolean; permissions: string[] }) => api.put(`/users/${id}/permissions`, data),
    updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
    getAuditLogs: (params?: { page?: number; limit?: number; action?: string; entityType?: string; search?: string }) => api.get('/admin/audit-logs', { params }),
};

export const employerApi = {
    getProfile: () => api.get('/employers/profile'),
    updateProfile: (data: unknown) => api.put('/employers/profile', data),
};

export const uploadApi = {
    upload: (data: FormData) => api.post<{ url: string }>('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const gdprApi = {
    getPreferences: () => api.get('/gdpr/preferences'),
    updatePreferences: (data: { subscribedToNewsletter: boolean }) => api.post('/gdpr/preferences', data),
    requestDeletion: () => api.post('/gdpr/delete-request'),
};

export const gdprAdminApi = {
    getRequests: () => api.get('/admin/gdpr/requests'),
    getUnsubscribed: () => api.get('/admin/gdpr/unsubscribed'),
    processRequest: (id: string, action: 'PROCESS' | 'CANCEL') => api.patch(`/admin/gdpr/requests/${id}`, { action }),
};

export const referralApi = {
    getMe: () => api.get('/referrals/me'),
    generateCode: () => api.post('/referrals/generate'),
    applyReferral: (data: { code: string }) => api.post('/referrals/apply', data),
    getAdminStats: () => api.get('/referrals/stats'),
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
    duration?: number;
    courseCode?: string;
    bannerUrl?: string;
    thumbnail?: string;
    jobRoles?: string[];
    courseType?: 'RECORDED' | 'LIVE' | 'HYBRID';
    hasInterviewPrep?: boolean;
    interviewPrice?: number;
    jobPrep?: boolean;
    fakeEnrolledCount?: number;
    fakeRating?: number;
    benefits?: unknown;
    specialOffers?: unknown;
    requireAdmissionFee?: boolean;
    admissionFee?: number;
    slug?: string;
    seoTitle?: string;
    metaDescription?: string;
    targetKeywords?: string[];
    faqs?: { question: string; answer: string }[];
    careerOpportunities?: unknown;
    salaryInsights?: unknown;
    projects?: unknown;
    prerequisites?: unknown;
    learningOutcomes?: unknown;
    toolsCovered?: string[];
    [key: string]: unknown;
}

// Course API
export const courseApi = {
    getAll: (params?: { category?: string; search?: string; page?: number; limit?: number; jobPrep?: boolean }) =>
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
    getAll: () => api.get('/admin/transactions'),
    getConfig: () => api.get('/payments/config'),
    updateConfig: (data: unknown) => api.put('/payments/config', data),
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
        stampUrl?: string;
        stampPosition?: string;
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
    captureDemo: (data: unknown) => api.post('/leads/demo', data),
    markSeen: () => api.post('/leads/mark-seen'),
    update: (id: string, data: unknown) => api.put(`/leads/${id}`, data),
    delete: (id: string) => api.delete(`/leads/${id}`),
    convert: (id: string) => api.post(`/leads/${id}/convert`),
    getAnalytics: (params?: unknown) => api.get('/leads/analytics', { params }),
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
    getDashboard: () => api.get('/analytics/dashboard'),
    getInterviewStats: () => api.get('/analytics/interviews'),
    getBenchmark: () => api.get('/analytics/benchmark'),
};

// Library API
export const libraryApi = {
    trackView: (resourceId: string) => api.patch(`/library/resources/${resourceId}/increment-views`),
    download: (resourceId: string) => api.get(`/library/resources/${resourceId}/download`, { responseType: 'blob' }),
    getBookmarks: () => api.get('/library/bookmarks'),
    toggleBookmark: (resourceId: string) => api.post('/library/bookmarks', { resourceId }),
    getResources: (params?: { category?: string; domain?: string; search?: string }) => api.get('/library/resources', { params }),
    getCategories: () => api.get('/library/categories'),
    updateResource: (id: string, data: unknown) => api.put(`/library/resources/${id}`, data),
    deleteResource: (id: string) => api.delete(`/library/resources/${id}`),
};

// Students API (Admin)
export const studentsApi = {
    getAll: (params?: { search?: string; course?: string; page?: number; limit?: number }) =>
        api.get('/admin/students', { params }),
};

export const rbacApi = {
    getFeatures: () => api.get('/rbac/features'),
    getRoles: () => api.get('/rbac/roles'),
    createRole: (data: { 
        name: string; 
        description?: string; 
        permissions: Array<{ featureId: string; canRead: boolean; canWrite: boolean; isDisabled: boolean }> 
    }) => api.post('/rbac/roles', data),
    updateRole: (id: string, data: { 
        name?: string; 
        description?: string; 
        permissions: Array<{ featureId: string; canRead: boolean; canWrite: boolean; isDisabled: boolean }> 
    }) => api.put(`/rbac/roles/${id}`, data),
    deleteRole: (id: string) => api.delete(`/rbac/roles/${id}`),
};

// Course Category API
export const courseCategoryApi = {
    // Public
    getAll: () => api.get('/course-categories'),
    // Admin-only
    getAllAdmin: () => api.get('/course-categories/admin'),
    create: (data: { name: string; slug: string; description?: string; icon?: string; color?: string; isActive?: boolean; orderIndex?: number }) =>
        api.post('/course-categories', data),
    update: (id: string, data: Partial<{ name: string; slug: string; description: string; icon: string; color: string; isActive: boolean; orderIndex: number }>) =>
        api.put(`/course-categories/${id}`, data),
    delete: (id: string) => api.delete(`/course-categories/${id}`),
};

// Gallery API
export const galleryApi = {
    getAll: () => api.get('/gallery'),
    add: (data: { url: string; caption?: string; order?: number }) => api.post('/gallery', data),
    delete: (id: string) => api.delete('/gallery', { params: { id } }),
};


// Coupon API
export const couponApi = {
    getAll: () => api.get('/coupons'),
    create: (data: { code: string; discountPercent: number; expiryDate: string; courseIds: string[]; usageLimit?: number | null }) => api.post('/coupons', data),
    delete: (id: string) => api.delete(`/coupons/${id}`),
    validate: (data: { code: string; courseId: string }) => api.post('/coupons/validate', data),
};

export default api;


// Batches API
export const batchesApi = {
    getAll: (params?: any) => api.get('/batches', { params }),
    getById: (id: string) => api.get(`/batches/${id}`),
    create: (data: any) => api.post('/batches', data),
    update: (id: string, data: any) => api.put(`/batches/${id}`, data),
    complete: (id: string) => api.patch(`/batches/${id}/complete`),
    getStudents: (id: string) => api.get(`/batches/${id}/students`),
    getAvailableStudents: (id: string) => api.get(`/batches/${id}/available-students`),
    addStudents: (id: string, data: { studentIds: string[] }) => api.post(`/batches/${id}/students`, data),
    getAttendance: (id: string, date: string) => api.get(`/batches/${id}/attendance`, { params: { date } }),
    markAttendance: (id: string, data: any) => api.post(`/batches/${id}/attendance`, data),
    getNotes: (id: string) => api.get(`/batches/${id}/notes`),
    addNote: (id: string, data: any) => api.post(`/batches/${id}/notes`, data),
    updateNoteStatus: (id: string, noteId: string, data: any) => api.patch(`/batches/${id}/notes/${noteId}/status`, data),
    scheduleLiveClass: (id: string, data: any) => api.post(`/batches/${id}/live-classes`, data),
    scheduleInterviews: (id: string, data: any) => api.post(`/batches/${id}/ai-interviews`, data),
};

