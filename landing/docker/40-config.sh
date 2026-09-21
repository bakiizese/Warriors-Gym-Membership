#!/bin/sh
# Writes /config.js from the container's environment so one image can point at
# any backend. Only the variables that are set end up in it; the page falls back
# to its own defaults for the rest.
set -eu

target=/usr/share/nginx/html/config.js
body=""

add() {
  name="$1"
  value="$(printenv "$name" || true)"
  [ -z "$value" ] && return 0

  # The value is written into JavaScript, so accept only a plain http(s) URL.
  case "$value" in
    http://* | https://*) ;;
    *)
      echo "40-config.sh: $name must start with http:// or https://" >&2
      exit 1
      ;;
  esac
  case "$value" in
    *[!A-Za-z0-9._~:/?#@!\&=+,%-]*)
      echo "40-config.sh: $name contains characters that are not allowed" >&2
      exit 1
      ;;
  esac

  body="${body}  ${name}: \"${value}\",
"
}

for name in API_URL ADMIN_WEB_URL ADMIN_MOBILE_URL MEMBER_MOBILE_URL APK_ADMIN_URL APK_MEMBER_URL GITHUB_URL; do
  add "$name"
done

printf 'window.__APP_CONFIG__ = {\n%s};\n' "$body" > "$target"
echo "40-config.sh: wrote $target"
