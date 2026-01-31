#!/bin/bash
# Push secrets from .dev.vars to Cloudflare Workers

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  [[ -z "$value" ]] && continue
  echo "Setting $key..."
  echo "$value" | npx wrangler secret put "$key"
done < .dev.vars

echo "Done."
