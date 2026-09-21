#!/bin/sh
# Writes the Cloudflare Pages _headers file for one of the sites.
#
#   pages-headers.sh landing|admin-web|mobile <output-dir>
#
# The landing page's Content-Security-Policy is the same one landing/docker/
# security-headers.inc.template gives the container: it may only call the API
# and only frame the two mobile apps. Addresses come from the environment.
set -eu

kind="$1"
out="$2"
file="$out/_headers"

case "$kind" in
  landing)
    : "${API_URL:?}" "${ADMIN_MOBILE_URL:?}" "${MEMBER_MOBILE_URL:?}"
    cat > "$file" <<EOF
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${API_URL}; frame-src ${ADMIN_MOBILE_URL} ${MEMBER_MOBILE_URL}; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/screens/*
  Cache-Control: public, max-age=86400
EOF
    ;;
  admin-web)
    cat > "$file" <<EOF
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
/assets/*
  Cache-Control: public, max-age=31536000, immutable
EOF
    ;;
  mobile)
    # No X-Frame-Options: the landing page embeds these apps in an iframe.
    cat > "$file" <<EOF
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/_expo/*
  Cache-Control: public, max-age=31536000, immutable
/assets/*
  Cache-Control: public, max-age=31536000, immutable
EOF
    ;;
  *)
    echo "pages-headers.sh: unknown kind '$kind'" >&2
    exit 1
    ;;
esac

echo "pages-headers.sh: wrote $file"
