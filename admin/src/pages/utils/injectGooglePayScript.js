export const injectGooglePayScript = () => {
  const scriptUrl = "https://pay.google.com/gp/p/js/pay.js";

  if (document.querySelector(`script[src="${scriptUrl}"]`)) {
    if (typeof window !== 'undefined' && typeof window.google !== 'undefined' && window.google.payments?.api?.PaymentsClient) {
      window.dispatchEvent(new CustomEvent("googlePayScriptLoaded"));
    }
    return;
  }

  const script = document.createElement("script");
  script.src = scriptUrl;
  script.async = true;
  
  script.onload = () => {
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.google !== 'undefined' && window.google.payments?.api?.PaymentsClient) {
        window.dispatchEvent(new CustomEvent("googlePayScriptLoaded"));
      } else {
        window.dispatchEvent(new CustomEvent("googlePayScriptLoaded"));
      }
    }, 500);
  };

  script.onerror = () => {
    window.dispatchEvent(new CustomEvent("googlePayScriptError"));
  };

  document.head.appendChild(script);
};

