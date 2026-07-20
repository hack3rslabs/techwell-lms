const aiService = require('../services/ai.service');

exports.analyzeATS = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        
        if (!jobDescription || !resumeText) {
            return res.status(400).json({ error: 'Job description and resume text are required.' });
        }

        if (String(resumeText || '').trim().length === 0) {
            return res.status(400).json({ error: 'Resume text is empty.' });
        }

        // Call AI Service
        const result = await aiService.analyzeResumeATS(resumeText, jobDescription);
        
        // Match the frontend expectation: data.success and data.data
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Error analyzing ATS resume:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze resume. Please try again.' });
    }
};

exports.analyzeLinkedIn = async (req, res) => {
    try {
        const { profileData, targetRole } = req.body;
        
        if (!profileData || !targetRole) {
            return res.status(400).json({ error: 'Profile data and target role are required.' });
        }

        // Call AI Service
        const result = await aiService.analyzeLinkedInProfile(profileData, targetRole);
        
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Error analyzing LinkedIn profile:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze LinkedIn profile. Please try again.' });
    }
};
