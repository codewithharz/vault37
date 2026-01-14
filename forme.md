curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@vault37.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "phone": "+2348012345678"
  }' | python3 -m json.tool


const BASE_URL = 'http://127.0.0.1:5001/api';
const ADMIN_EMAIL = 'admin_trade@vault37.com';
const USER_EPS_EMAIL = 'user_eps@vault37.com';
const USER_TPM_EMAIL = 'user_tpm@vault37.com';
const PASSWORD = 'SecurePass123!';


curl -X POST -H "Content-Type: application/json" -d '{"email":"user_tpm@vault37.com","password":"SecurePass123!"}' http://localhost:3000/api/auth/login


1.  Navigate to `http://localhost:3000/en/login`.
2.  Log in using Email: `user_tpm@vault37.com` and Password: `SecurePass123!`.
3.  Verify that it redirects to either `/dashboard` or `/admin` (based on role). 
    *   For `user_tpm`, it should go to `/dashboard`.
4.  Capture a screenshot of the Dashboard once loaded.
5.  Confirm that "My Dashboard" text is visible.
6.  Return "Success: Logged in as User TPM".

login email: admin@vault37.com
login password: password123

login email: user_tpm@vault37.com
login password: SecurePass123!



Apart from a password, there are several layers of security and "intentionality" we can add to the verification modal to ensure the platform's stability. Here are the most effective options for high-stakes systems like Vault37:

1. Audit Reason (Highly Recommended)
Require the admin to type a brief justification for the change (e.g., "Adjusting TPIA profit to match seasonal market performance").

Benefit: If something goes wrong later, you can look at the audit logs and see exactly why the decision was made.
Security: Discourages "lazy" changes and creates a paper trail for auditors.
2. Confirmation String
Asking the user to type a specific phrase, like "CONFIRM CHANGES" or "RESET TO DEFAULTS".

Benefit: This breaks the "muscle memory" of just clicking through modals. It forces the admin to stop and think for the 3–5 seconds it takes to type the phrase.
3. Dedicated Admin PIN
A separate 6-digit Numerical PIN that is different from their login password.

Benefit: Even if an admin's password is saved in a browser or compromised, a secondary PIN (held only in their head) adds a high-security barrier specifically for "structural" platform changes.
4. Two-Factor Authentication (2FA / OTP)
Requesting a code from an authenticator app (Google Authenticator) or an email/SMS OTP.

Benefit: This is the industry standard for "critical actions." It ensures that the person making the change physically possesses the registered device.
5. "Double-Sign" (Maker-Checker)
Instead of the change taking effect immediately, it moves to a "Pending Settings Approval" state where another admin must approve it.

Benefit: Eliminates the "single point of failure." One person can't accidentally (or maliciously) change the platform's faith alone.



<!--  -->
<!--  -->
<!--  -->
<!--  -->

Clearing existing database collections to prepare for fresh data seeding

node -e 'const mongoose = require("mongoose"); require("dotenv").config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const collections = await mongoose.connection.db.collections(); for (let collection of collections) { await collection.drop(); console.log(`Dropped collection: ${collection.collectionName}`); } mongoose.disconnect(); }).catch(err => { console.error(err); process.exit(1); })'