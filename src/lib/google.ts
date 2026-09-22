export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_APP_URL || fallback;
}
