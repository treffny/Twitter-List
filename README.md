# Sixth Field Tweet Proxy (XML tolerant)

Uses fast-xml-parser with boolean attributes enabled to handle broken RSS feeds.
Includes /api/health diagnostics.

## Deploy
Push to GitHub, import in Vercel, set env vars from .env.example, deploy.

## Endpoints
- /api/tweets?days=2
- /api/tweets/<handle>?days=2
- /api/health?handle=<handle>&days=2
