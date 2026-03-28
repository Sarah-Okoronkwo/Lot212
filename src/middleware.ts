import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── Blocked paths (spam, probes, hacks) ──────────────────────────────────
const BLOCKED_PATHS = [
  '/bisaifenxi',
  '/wp-admin',
  '/cmd_sco',
  '/wp-login',
  '/phpmyadmin',
  '/phpMyAdmin',
  '/.env',
  '/.git',
  '/xmlrpc',
  '/shell',
  '/setup.php',
  '/install.php',
  '/config.php',
  '/etc/passwd',
  '/admin.php',
  '/boaform',
  '/cgi-bin',
];

// ─── Blocked user-agent keywords ──────────────────────────────────────────
const BLOCKED_UA_KEYWORDS = [
  'zgrab', 'masscan', 'nmap', 'nikto', 'sqlmap',
  'dirbuster', 'nuclei', 'python-requests', 'go-http-client',
  'curl/', 'wget/', 'java/', 'bytespider', 'petalbot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
  'gptbot', 'chatgpt-user', 'ccbot', 'claudebot', 'anthropic-ai',
];

// ─── Allowed bots (SEO — do not block) ────────────────────────────────────
const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'facebot', 'twitterbot', 'linkedinbot', 'whatsapp',
  'applebot', 'vercelbot',
];

function shouldBlock(request: NextRequest): boolean {
  const path = request.nextUrl.pathname.toLowerCase();
  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  // Block suspicious paths
  if (BLOCKED_PATHS.some((p) => path.startsWith(p.toLowerCase()))) {
    return true;
  }

  // Always allow good SEO bots
  if (ALLOWED_BOTS.some((b) => ua.includes(b))) {
    return false;
  }

  // Block bad user agents
  if (BLOCKED_UA_KEYWORDS.some((k) => ua.includes(k))) {
    return true;
  }

  // Block empty or suspiciously short user agents
  if (!ua || ua.length < 10) {
    return true;
  }

  return false;
}

// ─── Middleware ────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  // 1. Bot/spam check runs first, before anything else
  if (shouldBlock(request)) {
    return new NextResponse(null, { status: 403 });
  }

  // 2. Everything below is your original auth logic — unchanged
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const isLoginPage = pathname === '/admin/login';
  const isAdminPage = pathname.startsWith('/admin') && !isLoginPage;

  if (isAdminPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// ─── Matcher: expanded to cover all routes (not just /admin) ──────────────
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};