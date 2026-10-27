RADIO BAHRAIN — SHARED PRODUCTION CALENDAR

This website connects to your EXISTING Airtable base (33 initiatives). Do not re-import the data.

SET UP
1. Create a Netlify account at https://app.netlify.com
2. Deploy THIS FOLDER (RBC_Calendar_Netlify) via Netlify deploys, or use GitHub repository deployment. Serverless Functions must be deployed with the site. A simple static-only upload may not build Functions; Git deploy is recommended.
3. Netlify dashboard > Project configuration > Environment variables > Add variables:
   AIRTABLE_TOKEN = Airtable personal access token (not shared in frontend)
   RBC_TEAM_PASSWORD = new random team password (at least 12 characters)
4. Airtable token: https://airtable.com/create/tokens
   Grant scopes data.records:read and data.records:write.
   Limit resource access to the base Radio Bahrain | Team Calendar 2026 only.
5. IMPORTANT: Trigger a fresh production deployment after setting the environment variables. Netlify functions only see variables on deployment.
6. Open the Netlify https://<your-site>.netlify.app URL; team members enter RBC_TEAM_PASSWORD to access/edit.

SECURITY / LIMITATIONS
- Keep AIRTABLE_TOKEN secret. Never insert it into HTML, chat, or public GitHub.
- The shared password gives EVERYONE full read/edit/delete rights; no per-person permissions, audit of who edited, or individual accounts.
- Use this with a small trusted internal team only. For public access or stronger access controls add user sign-in + server-side authorization.
- Data refreshes every 30 seconds while the page is active; edits post directly to Airtable immediately.
- Deleting here deletes the record from Airtable. Last write wins on overlapping edits.
- No automatic backup: periodically export CSV using the calendar button.
- The app uses the existing Airtable base ID and table ID; changing databases needs code changes.
- No billed services are required for light usage within applicable free-plan limits; verify current Netlify/Airtable limits before use.
