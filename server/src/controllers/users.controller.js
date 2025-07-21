/**
 * SECURE USERS CONTROLLER - XSS Vulnerability Fixed
 * This controller now properly sanitizes user input to prevent XSS attacks
 */

// Security libraries for input sanitization
const escapeHtml = require('escape-html');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Setup DOMPurify for server-side sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

class UsersController {
    async updateProfile(req, res, next) {
        try {
            const { name, bio, email } = req.body;

            if (!name || !bio || !email) {
                return res.status(400).json({ error: 'Name, bio, and email are required' });
            }

            // SECURITY FIX: Sanitize all user inputs
            // 1. HTML escape simple text fields to prevent script injection
            const safeName = escapeHtml(name.trim());
            const safeEmail = escapeHtml(email.trim());
            
            // 2. Sanitize bio field allowing only safe HTML tags
            const safeBio = DOMPurify.sanitize(bio, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
                ALLOWED_ATTR: {}
            });

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
                            <p><strong>Name:</strong> ${safeName}</p>
                            <p><strong>Email:</strong> ${safeEmail}</p>
                            <div class="bio">
                                <strong>Bio:</strong><br>
                                ${safeBio}
                            </div>
                            <p><em>Profile saved successfully at ${new Date().toISOString()}</em></p>
                        </div>
                    </body>
                </html>
            `;

            // SECURITY: Add Content Security Policy header for defense in depth
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none';"
            );
            
            // Send sanitized HTML response
            res.type('html').send(profileHtml);

        } catch (error) {
            console.error('Error updating profile:', error);
            next(error);
        }
    }
}

module.exports = new UsersController();
