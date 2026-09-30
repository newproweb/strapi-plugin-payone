import { GOOGLE_PAY_SCRIPT_URL } from "../constants/google-pay";

const SCRIPT_SETTLE_DELAY_MS = 500;

export const isGooglePayLoaded = () => {
  try {
    return typeof window !== "undefined" && typeof window.google !== "undefined" && !!window.google.payments?.api?.PaymentsClient;
  } catch (e) {
    return false;
  }
};

const announce = (eventName) => window.dispatchEvent(new CustomEvent(eventName));

/** Adds the Google Pay script once and fires `googlePayScriptLoaded` / `googlePayScriptError` on window. */
export const loadGooglePayScript = () => {
  if (document.querySelector(`script[src="${GOOGLE_PAY_SCRIPT_URL}"]`)) {
    if (isGooglePayLoaded()) announce("googlePayScriptLoaded");
    return;
  }

  const script = document.createElement("script");
  script.src = GOOGLE_PAY_SCRIPT_URL;
  script.async = true;
  script.onload = () => setTimeout(() => announce("googlePayScriptLoaded"), SCRIPT_SETTLE_DELAY_MS);
  script.onerror = () => announce("googlePayScriptError");
  document.head.appendChild(script);
};
