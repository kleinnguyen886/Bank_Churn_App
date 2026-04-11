# Deployment Notes

Target: Render Web Service

- Build: pip install -r requirements.txt
- Start: gunicorn wsgi:app
- Verify: / and /api/health
