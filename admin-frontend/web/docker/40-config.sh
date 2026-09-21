#!/bin/sh
# Writes /config.js so the same image can point at any backend.
#   API_URL  base URL of the API as the *browser* sees it, e.g. https://api.example.com
set -eu

target=/usr/share/nginx/html/config.js
api_url="${API_URL:-}"

if [ -z "$api_url" ]; then
  echo "40-config.sh: API_URL is not set; the app will use its build-time address" >&2
  printf 'window.__APP_CONFIG__ = {};\n' > "$target"
  exit 0
fi

# The value is written into JavaScript, so accept only a plain http(s) URL.
case "$api_url" in
  http://* | https://*) ;;
  *)
    echo "40-config.sh: API_URL must start with http:// or https://" >&2
    exit 1
    ;;
esac
case "$api_url" in
  *[!A-Za-z0-9._~:/?#@!\&=+,%-]*)
    echo "40-config.sh: API_URL contains characters that are not allowed" >&2
    exit 1
    ;;
esac

printf 'window.__APP_CONFIG__ = { API_URL: "%s" };\n' "$api_url" > "$target"
echo "40-config.sh: API_URL set to $api_url"
