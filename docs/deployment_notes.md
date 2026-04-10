# Deployment Notes

Target: Render Web Service

- Build: pip install -r requirements.txt
- Start: gunicorn app:app
- Verify: / and /api/health
