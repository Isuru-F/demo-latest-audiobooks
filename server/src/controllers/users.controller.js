/**
 * SECURE CONTROLLER - XSS vulnerability has been fixed
 * User input is now properly escaped before rendering in HTML
 */
const escapeHtml = require('lodash.escape');

class UsersController {
    async updateProfile(req, res, next) {
        try {
            const { name, bio, email } = req.body;

            if (!name || !bio || !email) {
                return res.status(400).json({ error: 'Name, bio, and email are required' });
            }

            // SECURITY FIX: Escape all user input to prevent XSS attacks
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
                            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                            <div class="bio">
                                <strong>Bio:</strong><br>
                                ${escapeHtml(bio)}
                            </div>
                            <p><em>Profile saved successfully at ${new Date().toISOString()}</em></p>
                        </div>
                    </body>
                </html>
            `;

            // SECURITY FIX: Add CSP header and send escaped HTML
            res
                .set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self';")
                .send(profileHtml);

        } catch (error) {
            console.error('Error updating profile:', error);
            next(error);
        }
    }
}

module.exports = new UsersController();
