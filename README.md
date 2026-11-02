# Yur Skin Story

Create a new Lovable project named SkinTwin AI as a careful migration/rebuild of my existing Base44 SkinTwin app. Build a polished, mobile-first full-stack web app for the YouCam API Skin AI & eCommerce VTO hackathon. Product concept: SkinTwin — a user's digital skin twin, where they can take/upload a weekly face photo, receive a real Skin AI analysis, save each check-in, and compare skin changes over time in a progress dashboard. Include public marketing/landing pages and authenticated app routes: welcome/onboarding, dashboard, photo check-in/upload with clear photo guidance and consent, scan processing/loading/error states, detailed scan results with metric breakdown, history/timeline, side-by-side comparison, personalized advice/products catalogue, profile/settings, people/profile switching if supported by the existing product concept, support, privacy, terms, consent, photo-retention policy and medical disclaimer. Use secure user-scoped data access and private photo storage; never expose API secrets in frontend code. Implement server-side integration placeholders for YouCam Skin AI and eCommerce/VTO APIs, with environment variables/secrets documented; do not fake a real scan or silently save synthetic scores. If API credentials are not configured, show a clearly labelled demo/sample mode and never present sample output as a real medical result. Users must be able to delete their photos and account, and photo deletion must remove the actual stored file as well as related records. Provide a user data export/backup flow. Include accessibility, responsive layouts, empty/loading/error states, and robust authorization checks. Keep health/skin analysis language non-diagnostic and include appropriate disclaimers. Rebuild the app in Lovable's native stack; do not claim an automatic Base44 code/database transfer. Start by creating the complete frontend structure and schema/backend plan, then implement working flows in stages and report any credentials or external setup needed. Do not deploy/publish yet; first build and verify the migration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://yur-skin-story.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5558176f-8c74-49a3-ae17-1b54f91ed5d9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
