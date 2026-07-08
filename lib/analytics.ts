// lib/analytics.ts

export const trackEvent = async (action: string, payload: any = {}) => {
  // 1. Log in browser console with clear distinct styling
  console.log(
    `%c[Analytics: ${action}]`,
    "background: #7c3aed; color: #fff; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;",
    payload
  );

  // 2. Post to DB backend asynchronously
  try {
    const res = await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        payload,
      }),
    });
    
    if (!res.ok) {
      console.warn("Analytics API returned non-ok status:", res.status);
    }
  } catch (error) {
    // Fail silently on the UI so client flow is never interrupted
    console.error("Failed to store analytics action in database:", error);
  }
};
