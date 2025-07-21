const escape = require('escape-html');

/**
 * SECURE CONTROLLER - Fixed XSS vulnerability
 * This controller now properly sanitizes user input before rendering HTML
 */
class UsersController {
    async updateProfile(req, res, next) {
        try {
            const { name, bio, email } = req.body;

            if (!name || !bio || !email) {
                return res.status(400).json({ error: 'Name, bio, and email are required' });
            }

            // Input validation - prevent excessively long inputs
            if (name.length > 200) {
                return res.status(400).json({ error: 'Name must be 200 characters or less' });
            }
            if (bio.length > 1000) {
                return res.status(400).json({ error: 'Bio must be 1000 characters or less' });
            }
            if (email.length > 254) { // RFC 5321 email length limit
                return res.status(400).json({ error: 'Email must be 254 characters or less' });
            }

            // Email validation using basic regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Please provide a valid email address' });
            }

            // SECURITY FIX: HTML escape all user inputs to prevent XSS
            const profileHtml = `
                <html>
                    <head>
                        <title>User Profile</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .profile { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
                            .bio { margin-top: 10px; background: #f5f5f5; padding: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="profile">
                            <h2>User Profile Updated</h2>
                            <p><strong>Name:</strong> ${escape(name)}</p>
                            <p><strong>Email:</strong> ${escape(email)}</p>
                            <div class="bio">
                                <strong>Bio:</strong><br>
                                ${escape(bio)}
                            </div>
                            <p><em>Profile saved successfully at ${new Date().toISOString()}</em></p>
                        </div>
                    </body>
                </html>
            `;

            // Security headers to provide defense-in-depth
            res.setHeader('Content-Security-Policy', "default-src 'self'");
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            res.send(profileHtml);

        } catch (error) {
            console.error('Error updating profile:', error);
            next(error);
        }
    }
}

module.exports = new UsersController();
