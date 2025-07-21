/**
 * VULNERABLE CONTROLLER - FOR DEMO PURPOSES ONLY
 * This controller contains an intentional XSS vulnerability
 * It directly outputs user input without sanitization
 */
class UsersController {
    async updateProfile(req, res, next) {
        try {
            const { name, bio, email } = req.body;

            if (!name || !bio || !email) {
                return res.status(400).json({ error: 'Name, bio, and email are required' });
            }

            // VULNERABILITY: Direct HTML output without sanitization
            // This allows malicious scripts to be executed in the browser
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
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <div class="bio">
                                <strong>Bio:</strong><br>
                                ${bio}
                            </div>
                            <p><em>Profile saved successfully at ${new Date().toISOString()}</em></p>
                        </div>
                    </body>
                </html>
            `;

            // CRITICAL VULNERABILITY: Using res.send() with unsanitized user input
            // Any JavaScript in the 'bio' field will be executed
            res.send(profileHtml);

        } catch (error) {
            console.error('Error updating profile:', error);
            next(error);
        }
    }
}

module.exports = new UsersController();
