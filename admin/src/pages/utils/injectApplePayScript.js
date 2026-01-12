export const injectApplePayScript = () => {

  if (typeof window === 'undefined') {
    return;
  }

  const checkApplePay = () => {
    try {
      return typeof window.ApplePaySession !== 'undefined' &&
        typeof window.ApplePaySession.canMakePayments === 'function';
    } catch (e) {
      return false;
    }
  };

  if (checkApplePay()) {
    window.dispatchEvent(new CustomEvent("applePayAvailable"));
  } else {
    const checkInterval = setInterval(() => {
      if (checkApplePay()) {
        clearInterval(checkInterval);
        window.dispatchEvent(new CustomEvent("applePayAvailable"));
      }
    }, 200);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (!checkApplePay()) {
        window.dispatchEvent(new CustomEvent("applePayNotAvailable"));
      }
    }, 5000);
  }
};

