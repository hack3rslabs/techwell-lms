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

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'candidate-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('document');
        if (extname || mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File type not supported!'));
        }
    }
});

router.get('/public/invite/:token', verifyInvitation);
router.post('/public/invite/:token/status', require('../controllers/consultancy.controller').updatePublicStatus);
router.post('/public/invite/:token/upload', upload.single('file'), require('../controllers/consultancy.controller').uploadCandidateDocument);
router.post('/public/invite/:token/submit', submitAgreement);

// -------------------------------------------------------------
// ADMIN ROUTES (Protected)
// -------------------------------------------------------------
// Apply authentication and authorization for all routes below this line
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'));
router.use(checkPermission('CONSULTANCY'));

router.get('/dashboard', getDashboardStats);
router.get('/invitations', getInvitations);
router.post('/invitations', createInvitation);
router.put('/invitations/:id', updateInvitation);
router.patch('/candidates/:id/status', updateCandidateStatus);
router.post('/invitations/:id/auto-match', autoMatchJobs);

module.exports = router;
