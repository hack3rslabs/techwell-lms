# Frontend Login Configuration & API Setup

## 1. API Base URL Configuration

**File:** [frontend/lib/api.ts](frontend/lib/api.ts#L3)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
```

**Key Points:**
- Uses environment variable: `NEXT_PUBLIC_API_URL`
- **Default fallback:** `http://localhost:5001/api` (if env var is not set)
- This is a **Next.js public environment variable** (accessible in browser)

**⚠️ CRITICAL:** If this env var is not set, frontend will try to connect to `http://localhost:5001/api`

---

## 2. Frontend Ports

**Development:**
- Frontend runs on **port 3000** (Next.js default)
- Script: `next dev -H 0.0.0.0` (binds to all interfaces)

**Production Docker:**
- Configured in `docker-compose.prod.yml` with `NEXT_PUBLIC_API_URL` environment variable

---

## 3. Login API Flow

### Step 1: Login Page ([frontend/app/login/page.tsx](frontend/app/login/page.tsx#L38))
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
        await login(email, password)  // ← calls auth context
        router.push('/dashboard')
    } catch (err: unknown) {
        const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed. Please try again.'
        setError(errorMessage)  // ← displays error to user
    } finally {
        setIsLoading(false)
    }
}
```

### Step 2: Auth Context ([frontend/lib/auth-context.tsx](frontend/lib/auth-context.tsx#L65))
```typescript
const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
};
```

### Step 3: API Call ([frontend/lib/api.ts](frontend/lib/api.ts#L56))
```typescript
login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
```

**Full Request Details:**
- **Method:** POST
- **Endpoint:** `/auth/login` (appended to `API_URL`)
- **Full URL:** `${NEXT_PUBLIC_API_URL}/auth/login` → defaults to `http://localhost:5001/api/auth/login`
- **Content-Type:** `application/json`
- **Credentials:** `withCredentials: true` (includes cookies)

---

## 4. Axios Configuration ([frontend/lib/api.ts](frontend/lib/api.ts#L1-L50))

```typescript
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,  // ← Include cookies in requests
});

// Request interceptor: adds Authorization header with token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor: handles 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## 5. Error Messages Displayed to User

**Error Display:** [frontend/app/login/page.tsx](frontend/app/login/page.tsx#L145)

The frontend shows:
1. Error from backend response: `err.response.data.error`
2. Fallback message: `'Login failed. Please try again.'`

---

## 6. Environment Variable Configuration

### Development:
- Not set → uses default `http://localhost:5001/api`
- To override, set: `NEXT_PUBLIC_API_URL=http://your-backend-url/api`

### Production (docker-compose.prod.yml):
```yaml
frontend:
  build: ./frontend
  environment:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:?}  # ← REQUIRED!
    NODE_ENV: ${NODE_ENV:-production}
  depends_on:
    - backend
  restart: unless-stopped
```

**Must be set when deploying!**

---

## 🔍 TROUBLESHOOTING: Why "Login Failed"?

### Likely Causes:

1. **Wrong Backend URL**
   - Frontend default: `http://localhost:5001/api`
   - Backend actual: `http://localhost:5000/api` ❌
   - **Fix:** Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

2. **Backend not running**
   - Verify backend is listening on the correct port

3. **CORS issue**
   - Check backend CORS configuration
   - Frontend sends requests with `withCredentials: true`

4. **Network/DNS issue**
   - If using Docker, service names matter
   - If frontend outside Docker, may need IP instead of localhost

5. **Backend response format**
   - Backend must return: `{ token: "...", user: {...} }` on successful login
   - Error response must include: `{ error: "error message" }`

---

## 📝 Quick Reference

| Component | URL/Port | Details |
|-----------|----------|---------|
| Frontend Dev | http://localhost:3000 | Next.js dev server |
| Backend | http://localhost:5001/api | Default, check `NEXT_PUBLIC_API_URL` |
| Login Endpoint | POST /auth/login | Expects `{email, password}` |
| Response | `{token, user}` | Stored in localStorage |

