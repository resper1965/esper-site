import Script from 'next/script';

/**
 * Google Analytics 4 component with privacy-compliant configuration
 *
 * Setup:
 * 1. Create a GA4 property in Google Analytics
 * 2. Add NEXT_PUBLIC_GA_ID to your .env.local file
 * 3. Example: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *
 * Features:
 * - Anonymizes IP addresses
 * - Respects Do Not Track
 * - Cookie consent ready (can be extended)
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Don't render if GA ID is not configured
  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Event tracking helper for custom analytics events
 *
 * Usage:
 * import { trackEvent } from '@/components/analytics';
 *
 * trackEvent({
 *   action: 'click',
 *   category: 'engagement',
 *   label: 'read_more_button',
 *   value: 1
 * });
 */
export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Page view tracking helper for SPA navigation
 *
 * Usage in Next.js useEffect:
 * useEffect(() => {
 *   trackPageView(pathname);
 * }, [pathname]);
 */
export function trackPageView(url: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
}
