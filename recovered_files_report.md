# Recovered Files Report

These files were recovered from git's internal cache. They don't have their original filenames, but you can identify them by their contents.

### File: 02ad0ffd18b909c06a87e6b4d78b0cff5fa6dcb9.txt
**Size:** 30.08 KB

```javascript
"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { rbacApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, UserX, Loader2, Eye, Plus, Trash2, Shield, ShieldAlert, Edit2, Download } from 'lucide-react'
import ExcelJS from 'exceljs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from '@/lib/export-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
```

---

### File: 03a206825d24ceac954c21f6958b6b6eb5059cd1.txt
**Size:** 26.98 KB

```javascript
"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Link2, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Sparkles, Loader2 } from "lucide-react"

const defaultTerms = `# CONSULTANCY TERMS & CONDITIONS

## Candidate Declaration
```

---

### File: 03f33bf04df7b0b997a1a48be1e0098a6dcc0f04.txt
**Size:** 27.99 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform-wide statistics for Admin Dashboard
 * @access  Private/Admin
 */
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'), async (req, res, next) => {
    try {
```

---

### File: 06418bbce238517622774c4211932caff23b3055.txt
**Size:** 7.32 KB

```javascript
"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/api';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { IdleWarningModal } from '@/components/auth/IdleWarningModal';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    regId?: string;
    rolePermissions?: Record<string, { canRead: boolean; canWrite: boolean; isDisabled: boolean }>;
```

---

### File: 085c8c2196ce0b40e18713bd93bb962effd12182.txt
**Size:** 564.37 KB

```javascript
{
  "name": "frontend",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "frontend",
      "version": "0.1.0",
      "dependencies": {
        "@grapesjs/react": "^2.0.0",
        "@hello-pangea/dnd": "^18.0.1",
        "@hookform/resolvers": "^5.2.2",
        "@next/third-parties": "^16.2.9",
        "@radix-ui/react-checkbox": "^1.3.3",
```

---

### File: 0976dede798259e82fbed4758b76c20499bf7e47.txt
**Size:** 4.33 KB

```javascript
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Employer {
    id: string
    name: string
    email: string
```

---

### File: 0d6b51b86fb49a653bab8b182257ea7a4be2f80d.txt
**Size:** 0.41 KB

```javascript
import { render } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { redirect } from 'next/navigation'
import Home from '../app/page'

test('redirects to courses page', () => {
  try {
    render(<Home />)
  } catch {
    // redirect throws in Next.js server components
```

---

### File: 1627227b4f32cb5f5c965ff02e078ffa36fd47cf.txt
**Size:** 27.83 KB

```javascript
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GraduationCap, Video, Building2, Handshake, ArrowRight, PlayCircle, School, MessageCircle, Send, Phone, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isVideoOpen, setIsVideoOpen] = useState(false)

```

---

### File: 1eaf118ea69f5ba1cc0fee03a428b47c3d8e982a.txt
**Size:** 25.21 KB

```javascript
"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { QRCodeCanvas } from 'qrcode.react'
import { format } from 'date-fns'
```

---

### File: 1ee1de5e2581808b327d254142dd6ee676ed80aa.txt
**Size:** 0.74 KB

```javascript
const express = require('express');
const { getAds, getActiveAds, createAd, updateAd, deleteAd, recordView, recordClick } = require('../controllers/ads.controller');
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public route to fetch active ads
router.get('/active', getActiveAds);
router.post('/:id/view', recordView);
router.post('/:id/click', recordClick);

// Admin routes
router.get('/', authenticate, checkPermission('MARKETING'), getAds);
router.post('/', authenticate, checkPermission('MARKETING'), createAd);
router.put('/:id', authenticate, checkPermission('MARKETING'), updateAd);
```

---

### File: 207ec3f08071ffb19407d02bff1a8221d21b1cba.txt
**Size:** 6.06 KB

```javascript
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * JWT Authentication Middleware
 * Verifies the token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
```

---

### File: 2cc0fbbfe08ed4fa853ee828fb3c56b570b98ea2.txt
**Size:** 0.04 KB

```javascript
2cc0fbbfe08ed4fa853ee828fb3c56b570b98ea2
```

---

### File: 2cc62ef3ad6b81c7882048c38a8d33fa872300e0.txt
**Size:** 16.92 KB

```javascript
"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Clock, Calendar, Target, TrendingUp, Users, Inbox, PhoneCall, History, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { StaffCheckInBanner } from '@/components/admin/StaffCheckInBanner'
import { Badge } from '@/components/ui/badge'

export default function StaffDashboardPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = React.useState(true)
```

---

### File: 2d63691b577d97583dc3bfb4bbf95983d28c63de.txt
**Size:** 18.27 KB

```javascript
const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });



// Configure storage for profile pictures
```

---

### File: 2daa5efcb05bc1320a208bcbe3ff2de58defd029.txt
**Size:** 0.44 KB

```javascript
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We pass the build-time env variable
ENV NEXT_PUBLIC_API_URL=https://techwell.co.in/api
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
```

---

### File: 2e93da934948f423a962f0493a1cf5399d790fe7.txt
**Size:** 1.43 KB

```javascript
const express = require('express');
const { 
    verifyInvitation, 
    submitAgreement, 
    getDashboardStats, 
    getInvitations, 
    createInvitation,
    updateInvitation,
    updateCandidateStatus,
    autoMatchJobs
} = require('../controllers/consultancy.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

```

---

### File: 347198076549cdb8f179faa461b44e1e1f4e5e89.txt
**Size:** 4.3 KB

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all ads (Admin)
exports.getAds = async (req, res) => {
    try {
        const ads = await prisma.adBanner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

```

---

### File: 372844c67c87368eee2d0f1877ea351c9a047afa.txt
**Size:** 31.98 KB

```javascript
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Initialize Gemini
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    console.error('CRITICAL ERROR: GEMINI_API_KEY is not defined in the environment variables!');
}
const genAI = new GoogleGenerativeAI(GEMINI_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

```

---

### File: 3793904890eb58bd2de4838bc4ac0cfefe6dcd7d.txt
**Size:** 4.67 KB

```javascript
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
```

---

### File: 3b4abd7f87f098df2bc2e29fc829e51d397260cb.txt
**Size:** 44.45 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/emailSender');
const { sendDemoEmail, sendDemoWhatsApp } = require('../utils/notifications');
const AICore = require('../ai-core');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const upload = multer({ dest: 'uploads/temp/' });

```

---

### File: 40cbcf091016c1f2d3a057aa0b9ac2a7c8cf0a3e.txt
**Size:** 524.86 KB

```javascript
{
    "name": "techwell-backend",
    "version": "1.0.0",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
        "": {
            "name": "techwell-backend",
            "version": "1.0.0",
            "license": "ISC",
            "dependencies": {
                "@google/generative-ai": "^0.24.1",
                "@prisma/client": "6.12.0",
                "@serialport/parser-readline": "^13.0.0",
                "axios": "^1.18.1",
```

---

### File: 4190b86777d49d9273806df8c32aa4fb6090fb13.txt
**Size:** 20.4 KB

```javascript
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
```

---

### File: 41bbb2fc342d95e7ec7621be76cd3130055c1e3f.txt
**Size:** 2.25 KB

```javascript
services:
  # ── 1. Schema sync (runs once, then exits) ────────────────────────────────
  migrate:
    build: ./backend
    command: sh -c "npx prisma generate && npx prisma db push --skip-generate"
    environment:
      DATABASE_URL: ${DATABASE_URL:?DATABASE_URL is required}
      NODE_ENV: production
    restart: "no"
    # Do not include in healthcheck-based service meshes
    labels:
      com.docker.compose.exclude_from_hc: "true"

  # ── 2. Backend API ─────────────────────────────────────────────────────────
  backend:
```

---

### File: 44dab9545faa079ef0babff7da41a493c6b1cd5a.txt
**Size:** 9.18 KB

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { DATABASE_HELP, getDatabaseHealth, isDatabaseOfflineError } = require('./utils/database');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const courseRoutes = require('./routes/course.routes');
const interviewRoutes = require('./routes/interview.routes');
const eventsRoutes = require('./routes/events.routes');
const settingsRoutes = require('./routes/settings.routes');

const { twilioRouter } = require('./ai-core/providers/twilio');
```

---

### File: 4dbab4ac8eea8ee1b84ebe82b4a1c5456edcbac3.txt
**Size:** 20.86 KB

```javascript
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const upload = multer({ dest: 'uploads/temp/' });

const GEMINI_KEY = process.env.GEMINI_API_KEY;
```

---

### File: 50cc5ec397ac7f67020c6f9278c54bc410b28220.txt
**Size:** 2.12 KB

```javascript
# Master Start Script for Techwell LMS

Write-Host "Starting Techwell LMS Setup..." -ForegroundColor Cyan

# 1. Check for Node.js
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    Write-Host "Error: npm.cmd not found. Please install Node.js." -ForegroundColor Red
    exit
}

# 2. Check for PostgreSQL (Common service names)
$pgService = Get-Service | Where-Object { $_.Name -like "*postgres*" }
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
```

---

### File: 5802890608da783b1da3eba7f43b6fbede357b5c.txt
**Size:** 11.46 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   POST /api/staff/attendance/check-in
 * @desc    Check in for the day or start a new break session
 * @access  Private (Staff/Admin)
 */
router.post('/attendance/check-in', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const date = new Date();
```

---

### File: 584f25b9274e55a9c09d2fc7f1891c2c8c4a7023.txt
**Size:** 31.41 KB

```javascript
"use client"

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Video, Users, ArrowRight, Loader2, Share2, Download, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
```

---

### File: 5ba3b681d181cbddcf5fba93aff1857a2d881a96.txt
**Size:** 2.75 KB

```javascript
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "clean": "powershell -NoProfile -Command \"if (Test-Path .next) { Remove-Item -Recurse -Force .next }; if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }; npm.cmd install\""
  },
  "dependencies": {
    "@grapesjs/react": "^2.0.0",
    "@hello-pangea/dnd": "^18.0.1",
```

---

### File: 5de4b7abddb415f0af4cd762131048ee14f22618.txt
**Size:** 12.37 KB

```javascript
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware to optionally authenticate
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
```

---

### File: 5f697e7b4349dd710a28124cbafd68aeeb9a92b9.txt
**Size:** 25.23 KB

```javascript
"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { courseApi, courseCategoryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap, Search, Loader2, Clock, Users,
    BookOpen, ChevronLeft, ChevronRight, X, Star
} from 'lucide-react'
```

---

### File: 61634fd1ddbc48a82239512bf208d75bebb0f010.txt
**Size:** 60.96 KB

```javascript
"use client"

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api, { courseApi, interviewApi, certificateApi, liveClassApi } from '@/lib/api'
import Image from 'next/image'
import { getFullImageUrl } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap,
    Video,
    TrendingUp,
    Calendar,
```

---

### File: 63289fa920403d9c80834a5359b81c0885d5b9bc.txt
**Size:** 26.23 KB

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

```

---

### File: 68d4efdb1411444beb390fb3ad2b80f358eb58de.txt
**Size:** 0.88 KB

```javascript
FROM node:18-alpine

WORKDIR /app

# Install dependencies required for whatsapp-web.js (Puppeteer) in Alpine
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      curl

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
```

---

### File: 693f6a4c609de0b0015d95b5a527d8a0a3c325fb.txt
**Size:** 17.18 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/jobs
 * @desc    List public jobs
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const { type, location } = req.query;
```

---

### File: 6a358d1bdb4ae7cdccd86b7b8752488f98ea16e0.txt
**Size:** 5.27 KB

```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { generateRegId } = require('../utils/regIdGenerator');

// Initialize with Dummy Keys if missing
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy12345';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'secret_dummy12345';

const instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

```

---

### File: 708a9fc128304b6dddb7b0fc47ac74eedd2736ad.txt
**Size:** 4.24 KB

```javascript
#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Techwell LMS — Zero-Downtime Production Deployment Script
# Usage: ./deploy.sh
# Requires: Docker + Docker Compose v2, .env file in project root
# ─────────────────────────────────────────────────────────────────────────────

COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="techwell"
BACKUP_DIR="./db-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo ""
```

---

### File: 711723e863004506efda0b96fc8affafd26a3e0e.txt
**Size:** 10.14 KB

```javascript
"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, Target, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LeadAnalytics() {
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [readinessData, setReadinessData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
```

---

### File: 72532d41ed5e06debc905ec7bf5627409815d96b.txt
**Size:** 15.62 KB

```javascript
const express = require('express');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const AICore = require('../ai-core');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Helper to mask secrets
const mask = (str) => str ? `${str.substring(0, 4)}...${str.substring(str.length - 4)}` : '';
const isLiveRazorpayKey = (keyId = '') => keyId.startsWith('rzp_live_');

const getRazorpayCredentials = async (req) => {
    const config = await prisma.paymentConfig.findFirst();
    const liveKeyId = process.env.RAZORPAY_KEY_ID || config?.razorpayKeyId || '';
```

---

### File: 79c9cf53ba40c83483e482048f6caae04a1ff50b.txt
**Size:** 31.4 KB

```javascript
"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Check, X, Mail } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { TermsAcceptModal } from '@/components/ui/TermsAcceptModal'

```

---

### File: 7b63120dcd04cfd4b50efd0f7c278f74371d0aa8.txt
**Size:** 79.86 KB

```javascript
"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { courseApi, uploadApi, courseCategoryApi, type CoursePayload } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from "next/image"
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, GripVertical, Loader2, Plus, Upload, X, Wand2, ArrowRight, ArrowLeft } from 'lucide-react'
import { QuizBuilderDialog } from './QuizBuilderDialog'
import { VideoUpload } from '@/components/admin/VideoUpload'
import { getFullImageUrl } from '@/lib/image-utils'
```

---

### File: 7d6d69244ea8adcf716bfb55c5f560f326a69f59.txt
**Size:** 1.74 KB

```javascript
{
    "name": "techwell-backend",
    "version": "1.0.0",
    "description": "Techwell Platform Backend API",
    "main": "src/index.js",
    "scripts": {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js",
        "db:push": "prisma db push",
        "db:generate": "prisma generate",
        "db:seed": "node prisma/seed.js",
        "db:prepare": "npm run db:generate && npm run db:push && npm run db:seed",
        "db:studio": "prisma studio",
        "build": "npm run db:generate",
        "test": "jest"
```

---

### File: 8f9c23108ce0c960a4c73bdd694cc735261499ea.txt
**Size:** 15.16 KB

```javascript
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { userApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
```

---

### File: 92a2070c3f217a01daa82954de0f08c6d4d92441.txt
**Size:** 4.69 KB

```javascript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Briefcase,
    Video,
    BarChart3,
    LogOut,
    PlusCircle,
    Building2,
    Users,
    Search
```

---

### File: 9fac152ad3073880fd5ee8f0d2a8f66708045761.txt
**Size:** 73.28 KB

```javascript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                          String                    @id @default(cuid())
  email                       String                    @unique
  password                    String
  name                        String
  role                        Role                      @default(STUDENT)
```

---

### File: a9df7ae3277e41918ccab3e0bd586fa43df99576.txt
**Size:** 14.23 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * Helper: Ensure the special resume-builder course product exists in the DB
 */
const ensureResumeCourse = async () => {
    try {
        const existing = await prisma.course.findUnique({ where: { id: 'resume-builder' } });
        if (!existing) {
            // Find an instructor or super admin to assign to the course
```

---

### File: af089927b1e84a76523ab1de22f15d3ef6cbd84e.txt
**Size:** 11.45 KB

```javascript
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, MoreVertical, Download } from "lucide-react"
import AIAutoMatchDialog from "@/components/jobs/AIAutoMatchDialog"

interface ColumnConfig {
    title: string
```

---

### File: b506b64fe62e3870888321f592ded1769b2fb5f8.txt
**Size:** 13.78 KB

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Users (skip if exists)
    let superAdmin = await prisma.user.findUnique({ where: { email: 'admin@techwell.co.in' } });
    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
```

---

### File: b58974e61bb18c39f2f2cd10aca4227bbfdd95a1.txt
**Size:** 4.98 KB

```javascript
"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, RotateCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ConsultancyClosed() {
    const [candidates, setCandidates] = useState<any[]>([])

    useEffect(() => {
        fetchCandidates()
    }, [])
```

---

### File: bfd0e377cc2dfcebeecf5962e63d42f8ce733af7.txt
**Size:** 23.37 KB

```javascript
"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    Loader2,
    CheckCircle2,
    Lock,
    Menu,
    ChevronLeft,
```

---

### File: c704bdf760456698bcb7dd7830493fbe11cf8a99.txt
**Size:** 10.87 KB

```javascript
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// -------------------------------------------------------------
// PUBLIC API (For Candidates via Private Link)
// -------------------------------------------------------------

exports.verifyInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await prisma.consultancyInvitation.findUnique({
            where: { token },
            include: { agreement: true }
        });
```

---

### File: caa67570bc0b33a97bf6dfb515ba111f66970714.txt
**Size:** 9.56 KB

```javascript
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ShieldCheck, Trash2, Mail, XCircle, UserMinus } from 'lucide-react'
import { gdprAdminApi } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface GdprRequest {
    id: string
    name: string
```

---

### File: cb2177232efc911adef0004f3423f92a9e51ff6c.txt
**Size:** 18.44 KB

```javascript
/* eslint-disable */
@import "tailwindcss";
@import "tw-animate-css";

/* stylelint-disable */
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
```

---

### File: ddf2d533014fda0644c7e515f4c9572ab5a56481.txt
**Size:** 18.34 KB

```javascript
"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, AlertTriangle, X } from 'lucide-react'
import { LoginCharacter } from '@/components/auth/LoginCharacter'

export default function LoginPage() {
    const router = useRouter()
```

---

### File: deb8622be707f2db496aaab19912bac8ad6935d1.txt
**Size:** 18.1 KB

```javascript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    Video,
    Award,
    Settings,
    MessageSquare,
    Calendar,
```

---

### File: e0c6e0aa670c0a226179f807294ebea805d64005.txt
**Size:** 0.75 KB

```javascript
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
```

---

### File: e75dc1600fedf127f3be0800875a807a40f0b33e.txt
**Size:** 15.32 KB

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { sendEmail } = require('../utils/emailSender');

// Create and send message to students
exports.sendMessageToStudents = async (req, res) => {
  try {
    const { title, content, priority = 'NORMAL', isHtml = false, attachmentUrl, category, scheduledFor, expiresAt, parentId } = req.body;
    const senderId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
```

---

### File: e9dd421a51ba552fd4b95b3a6e75aa542dde7d1b.txt
**Size:** 25.53 KB

```javascript
"use client"

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Loader2, ExternalLink, Download, Edit, Image as ImageIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
```

---

### File: ec3fa567bef6cd81fc2b709e10a52d64a1a5a944.txt
**Size:** 21.53 KB

```javascript
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, User, LogOut, ChevronDown, ArrowUpRight, GraduationCap, Laptop, Sparkles, Building2, Briefcase } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
```

---

### File: f15040227ddb5a7199aedb3521a17e29e655f9e8.txt
**Size:** 1.65 KB

```javascript
const express = require('express');
const {
  sendMessageToStudents,
  sendMessageToBatch,
  sendMessageToStudent,
  getStudentMessages,
  markMessageAsRead,
  getUnreadCount,
  getAllMessages,
  deleteMessage,
  sendMessageToAdmin,
  createTemplate,
  getTemplates,
  deleteTemplate
} = require('../controllers/messages.controller');
```

---

### File: f15f861b79a0220a450c125a8bbda62ba927fc9f.txt
**Size:** 21.79 KB

```javascript
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Briefcase, Building2, Banknote, Clock, Share2, Bookmark, CheckCircle, GraduationCap, Globe, Sparkles } from "lucide-react"
import _Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
```

---

### File: f2e6d26b45330e0bb90097a37e6377dba43ad08a.txt
**Size:** 17.72 KB

```javascript
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Mail,
    Bell,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Eye,
} from 'lucide-react'
import api from '@/lib/api'
```

---

### File: f72dcc5bf80f448b618c35e001f31dc5df2bbe6f.txt
**Size:** 50.8 KB

```javascript
"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
```

---

### File: fd5f118edfe85cafd22cad1aaaf520bff2f0cb59.txt
**Size:** 21.42 KB

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
const { generateRegId } = require('../utils/regIdGenerator');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Helper to generate Batch Code (e.g., B-2026-06-001)
 */
async function generateBatchCode() {
    const now = new Date();
```

---


