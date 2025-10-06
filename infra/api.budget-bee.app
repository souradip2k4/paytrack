# ----------------------------------------------------------------------
# HTTP to HTTPS REDIRECT
# ----------------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name api.budget-bee.app;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

# ----------------------------------------------------------------------
# HTTPS CONFIGURATION
# ----------------------------------------------------------------------
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.budget-bee.app;

    location / {
        proxy_pass http://localhost:5101;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
