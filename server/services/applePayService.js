"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { getSettings, validateSettings } = require("./settingsService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

/**
 * Initialize Apple Pay session with Payone
 * According to Payone documentation:
 * https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
 * 
 * Request: genericpayment
 * Required parameters:
 * - request="genericpayment"
 * - clearingtype="wlt"
 * - wallettype="APL"
 * - add_paydata[action]="init_applepay_session"
 * - add_paydata[display_name]="Store Name"
 * - add_paydata[domain_name]="yourdomain.com"
 */
const initializeApplePaySession = async (strapi, params) => {
  try {
    strapi.log.info("[Apple Pay] Initializing Apple Pay session with Payone");
    strapi.log.info("[Apple Pay] Request params:", JSON.stringify(params, null, 2));

    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      strapi.log.error("[Apple Pay] Payone settings not configured");
      throw new Error("Payone settings not configured");
    }

    strapi.log.info("[Apple Pay] Settings loaded:", {
      mode: settings.mode,
      mid: settings.mid,
      portalid: settings.portalid,
      hasKey: !!settings.key
    });

    const {
      displayName,
      domainName,
      mid,
      portalid
    } = params;

    // Get merchant data from settings (test or live mode)
    const merchantName = displayName || settings.merchantName || settings.displayName || "Test Store";
    const merchantId = mid || settings.mid || settings.merchantIdentifier;
    const portalId = portalid || settings.portalid;
    const accountId = settings.aid;
    const apiKey = settings.key;
    const mode = settings.mode || "test"; // test or live

    // Get domain from params or settings or server config
    const domain = domainName || settings.domainName ||
      (strapi.config.get("server.url") ? new URL(strapi.config.get("server.url")).hostname : null) ||
      "localhost";

    // Build request parameters for Apple Pay session initialization
    // According to Payone documentation: request="genericpayment"
    const requestParams = {
      request: "genericpayment",
      mid: merchantId,
      aid: accountId,
      portalid: portalId,
      key: apiKey,
      mode: mode, // Use test or live mode from settings
      clearingtype: "wlt",
      wallettype: "APL",
      currency: "EUR", // Default, can be overridden
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": merchantName,
      "add_paydata[domain_name]": domain
    };

    strapi.log.info("[Apple Pay] Sending request to Payone:", {
      url: POST_GATEWAY_URL,
      mode: mode,
      merchantName: merchantName,
      domain: domain,
      merchantId: merchantId,
      portalId: portalId
    });

    const formData = toFormData(requestParams);

    strapi.log.info("[Apple Pay] Sending request to Payone API:", {
      url: POST_GATEWAY_URL,
      params: {
        ...requestParams,
        key: "***HIDDEN***" // Hide API key in logs
      }
    });

    let response;
    try {
      response = await axios.post(POST_GATEWAY_URL, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      });
    } catch (axiosError) {
      strapi.log.error("[Apple Pay] Payone API request failed:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method
        }
      });
      throw axiosError;
    }

    strapi.log.info("[Apple Pay] Payone response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    // Parse response
    const responseData = parseResponse(response.data, strapi.log);

    strapi.log.info("[Apple Pay] Session initialization response:", JSON.stringify(responseData, null, 2));
    strapi.log.info("[Apple Pay] Response status:", responseData.status || responseData.Status);
    strapi.log.info("[Apple Pay] Response errorcode:", responseData.errorcode || responseData.ErrorCode || "none");
    strapi.log.info("[Apple Pay] Response errormessage:", responseData.errormessage || responseData.ErrorMessage || responseData.errortxt || responseData.ErrorTxt || "none");
    strapi.log.info("[Apple Pay] All response keys:", Object.keys(responseData));

    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.warn("[Apple Pay] Response contains error:", {
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage
      });
    }

    return responseData;
  } catch (error) {
    strapi.log.error("[Apple Pay] Session initialization error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Validate Apple Pay merchant with Payone
 * This is called when Apple Pay requests merchant validation
 */
const validateApplePayMerchant = async (strapi, params) => {
  try {
    strapi.log.info("[Apple Pay] Validating merchant with Payone");
    strapi.log.info("[Apple Pay] Validation params:", JSON.stringify({
      validationURL: params.validationURL,
      domain: params.domain,
      displayName: params.displayName,
      mid: params.mid,
      portalid: params.portalid
    }, null, 2));

    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      strapi.log.error("[Apple Pay] Payone settings not configured for merchant validation");
      throw new Error("Payone settings not configured");
    }

    const {
      validationURL,
      mid,
      portalid,
      domain,
      displayName
    } = params;

    // Get merchant data from settings (test or live mode)
    const merchantName = displayName || settings.merchantName || settings.displayName || "Test Store";
    const merchantId = mid || settings.mid || settings.merchantIdentifier;
    const portalId = portalid || settings.portalid;

    // Get domain from params or settings or server config
    const domainName = domain || settings.domainName ||
      (strapi.config.get("server.url") ? new URL(strapi.config.get("server.url")).hostname : null) ||
      "localhost";

    // For Payone integration without developer account,
    // Payone handles merchant validation
    // We need to initialize the session first
    const sessionParams = {
      displayName: merchantName,
      domainName: domainName,
      mid: merchantId,
      portalid: portalId
    };

    strapi.log.info("[Apple Pay] Initializing session with params:", JSON.stringify(sessionParams, null, 2));

    // Initialize Apple Pay session with Payone
    let sessionResponse;
    try {
      sessionResponse = await initializeApplePaySession(strapi, sessionParams);
    } catch (error) {
      strapi.log.error("[Apple Pay] Failed to initialize session with Payone:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      // DO NOT return empty object - throw error instead
      // Empty object causes Apple Pay to close dialog without proper error message
      throw new Error(`Failed to initialize Apple Pay session with Payone: ${error.message}. Please check your Payone configuration and ensure Apple Pay is properly set up in PMI.`);
    }

    strapi.log.info("[Apple Pay] Session initialization result:", {
      status: sessionResponse.status || sessionResponse.Status,
      hasMerchantIdentifier: !!(sessionResponse.merchantIdentifier || sessionResponse.merchantSessionIdentifier),
      hasApplePaySession: !!(sessionResponse["add_paydata[applepay_payment_session]"] ||
        sessionResponse["add_paydata[applepay_payment_session]"] ||
        sessionResponse.add_paydata?.applepay_payment_session),
      fullResponse: JSON.stringify(sessionResponse, null, 2)
    });

    // If session initialization is successful, extract merchant session from Payone response
    // Payone returns: add_paydata[applepay_payment_session] = BASE64 encoded merchant session
    // Check for both uppercase and lowercase status
    const responseStatus = sessionResponse.status || sessionResponse.Status;
    if (responseStatus === "APPROVED" || responseStatus === "OK" ||
      responseStatus === "approved" || responseStatus === "ok") {

      // Extract BASE64 encoded merchant session from Payone response
      // Payone returns it in: add_paydata[applepay_payment_session]
      // Try all possible variations of the field name
      const applePaySessionBase64 =
        sessionResponse["add_paydata[applepay_payment_session]"] ||
        sessionResponse["add_paydata[applepay_payment_session]"] ||
        sessionResponse["add_paydata_applepay_payment_session"] ||
        sessionResponse.add_paydata?.applepay_payment_session ||
        sessionResponse.add_paydata?.["applepay_payment_session"] ||
        sessionResponse["addPaydata[applepay_payment_session]"] ||
        sessionResponse["addPaydata_applepay_payment_session"] ||
        null;

      strapi.log.info("[Apple Pay] Checking for merchant session in response:", {
        hasWorkorderid: !!sessionResponse.workorderid,
        workorderid: sessionResponse.workorderid,
        allKeys: Object.keys(sessionResponse).filter(k => k.includes('applepay') || k.includes('session') || k.includes('paydata')),
        responseKeys: Object.keys(sessionResponse)
      });

      strapi.log.info("[Apple Pay] Extracted Apple Pay session data:", {
        hasBase64Session: !!applePaySessionBase64,
        sessionLength: applePaySessionBase64?.length,
        workorderid: sessionResponse.workorderid,
        allResponseKeys: Object.keys(sessionResponse),
        responseSample: JSON.stringify(sessionResponse).substring(0, 500)
      });

      if (applePaySessionBase64 && applePaySessionBase64.length > 0) {
        try {
          // Decode BASE64 merchant session
          const merchantSessionJson = Buffer.from(applePaySessionBase64, 'base64').toString('utf-8');
          const merchantSession = JSON.parse(merchantSessionJson);

          strapi.log.info("[Apple Pay] Decoded merchant session:", {
            merchantIdentifier: merchantSession.merchantIdentifier,
            domainName: merchantSession.domainName,
            displayName: merchantSession.displayName,
            hasEpochTimestamp: !!merchantSession.epochTimestamp,
            hasExpiresAt: !!merchantSession.expiresAt,
            fullSession: merchantSession
          });

          // Validate decoded merchant session
          if (!merchantSession.merchantIdentifier) {
            strapi.log.warn("[Apple Pay] Decoded merchant session missing merchantIdentifier, using fallback");
            // Use fallback merchant identifier
            merchantSession.merchantIdentifier = settings.merchantIdentifier ||
              settings.mid ||
              settings.portalid ||
              `merchant.${domainName}`;
          }

          // Ensure epochTimestamp and expiresAt are in seconds (not milliseconds)
          if (merchantSession.epochTimestamp && merchantSession.epochTimestamp > 1000000000000) {
            // If timestamp is in milliseconds, convert to seconds
            merchantSession.epochTimestamp = Math.floor(merchantSession.epochTimestamp / 1000);
          }
          if (merchantSession.expiresAt && merchantSession.expiresAt > 1000000000000) {
            // If timestamp is in milliseconds, convert to seconds
            merchantSession.expiresAt = Math.floor(merchantSession.expiresAt / 1000);
          }

          // Validate final merchant session
          if (!merchantSession.merchantIdentifier || merchantSession.merchantIdentifier === 'undefined' || merchantSession.merchantIdentifier === 'null') {
            throw new Error("Decoded merchant session has invalid merchantIdentifier");
          }

          strapi.log.info("[Apple Pay] Validated merchant session:", {
            merchantIdentifier: merchantSession.merchantIdentifier,
            domainName: merchantSession.domainName,
            epochTimestamp: merchantSession.epochTimestamp,
            expiresAt: merchantSession.expiresAt
          });

          return merchantSession;
        } catch (decodeError) {
          strapi.log.error("[Apple Pay] Failed to decode merchant session:", {
            error: decodeError.message,
            base64Length: applePaySessionBase64?.length,
            base64Preview: applePaySessionBase64?.substring(0, 100)
          });

          // If decoding fails, we cannot proceed - merchant session is invalid
          throw new Error(`Failed to decode Apple Pay merchant session: ${decodeError.message}`);
        }
      } else {
        // CRITICAL: If Payone doesn't return merchant session, we cannot proceed
        // Apple Pay requires the merchant session to be validated by Apple's servers
        // Payone should return add_paydata[applepay_payment_session] after successful initialization
        strapi.log.error("[Apple Pay] CRITICAL: No Apple Pay session data in Payone response!");
        strapi.log.error("[Apple Pay] This means merchant validation will fail. Possible causes:");
        strapi.log.error("[Apple Pay] 1. Apple Pay not properly configured in Payone PMI");
        strapi.log.error("[Apple Pay] 2. Domain not verified in Payone PMI");
        strapi.log.error("[Apple Pay] 3. Merchant identifier not configured in Payone PMI");
        strapi.log.error("[Apple Pay] 4. Apple Pay onboarding not completed in Payone PMI");
        strapi.log.error("[Apple Pay] Response status:", responseStatus);
        strapi.log.error("[Apple Pay] Full response keys:", Object.keys(sessionResponse));
        strapi.log.error("[Apple Pay] Response sample:", JSON.stringify(sessionResponse).substring(0, 1000));

        // DO NOT create a fallback session - it will fail validation
        // Instead, throw an error so the frontend knows validation failed
        throw new Error("Payone did not return Apple Pay merchant session. Please ensure Apple Pay is properly configured in Payone Merchant Interface (PMI): CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay configuration. The merchant session must come from Payone after successful Apple Pay onboarding.");

        // Get merchant identifier from settings
        // According to Payone docs, merchant identifier should be visible in PMI after onboarding
        // Path: CONFIGURATION/PAYMENT PORTALS - choose an onboarded Portal - Payment type configuration tab
        let merchantIdentifier = settings.merchantIdentifier ||
          settings.mid ||
          settings.portalid;

        // If still no merchant identifier, try to construct one from domain
        // But this is not ideal - merchant identifier should come from Payone PMI
        if (!merchantIdentifier) {
          strapi.log.warn("[Apple Pay] No merchant identifier found in settings, using domain-based fallback");
          merchantIdentifier = `merchant.${domainName}`;
        }

        // Ensure merchant identifier is a string and not empty
        merchantIdentifier = merchantIdentifier.toString().trim();
        if (!merchantIdentifier || merchantIdentifier === 'undefined' || merchantIdentifier === 'null') {
          strapi.log.error("[Apple Pay] Invalid merchant identifier:", merchantIdentifier);
          throw new Error("Merchant identifier is invalid. Please configure a valid merchant identifier in Payone Merchant Interface (PMI) after Apple Pay onboarding. Path: CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab");
        }

        // Create a valid merchant session object
        // This format is required by Apple Pay Payment Request API
        // IMPORTANT: epochTimestamp and expiresAt must be in seconds (Unix timestamp), not milliseconds
        const merchantSession = {
          epochTimestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
          expiresAt: Math.floor((Date.now() + (5 * 60 * 1000)) / 1000), // 5 minutes from now, in seconds
          merchantSessionIdentifier: `merchant.${domainName}`,
          nonce: generateNonce(),
          merchantIdentifier: merchantIdentifier, // Already validated and converted to string
          domainName: domainName,
          displayName: merchantName
        };

        // Validate merchant session before returning
        if (!merchantSession.merchantIdentifier || merchantSession.merchantIdentifier === 'undefined' || merchantSession.merchantIdentifier === 'null') {
          strapi.log.error("[Apple Pay] Created merchant session is missing or invalid merchantIdentifier!", {
            merchantIdentifier: merchantSession.merchantIdentifier,
            settings: {
              hasMerchantIdentifier: !!settings.merchantIdentifier,
              hasMid: !!settings.mid,
              hasPortalid: !!settings.portalid,
              mid: settings.mid,
              portalid: settings.portalid
            }
          });
          throw new Error("Merchant identifier is required but not found in settings. Please configure merchant identifier in Payone Merchant Interface (PMI) after Apple Pay onboarding.");
        }

        strapi.log.info("[Apple Pay] Created merchant session from settings:", {
          merchantIdentifier: merchantSession.merchantIdentifier,
          domainName: merchantSession.domainName,
          displayName: merchantSession.displayName,
          epochTimestamp: merchantSession.epochTimestamp,
          expiresAt: merchantSession.expiresAt
        });

        return merchantSession;
      }
    }

    // If initialization failed, we cannot proceed
    // Payment Request API requires a valid merchant session
    strapi.log.error("[Apple Pay] Session initialization failed - status:", responseStatus);
    strapi.log.error("[Apple Pay] Full Payone response:", JSON.stringify(sessionResponse, null, 2));
    strapi.log.error("[Apple Pay] This means merchant validation will fail.");
    strapi.log.error("[Apple Pay] Possible causes:");
    strapi.log.error("[Apple Pay] 1. Payone returned ERROR status - check errorcode and errormessage in response");
    strapi.log.error("[Apple Pay] 2. Apple Pay not configured in Payone PMI");
    strapi.log.error("[Apple Pay] 3. Domain not verified in Payone PMI");
    strapi.log.error("[Apple Pay] 4. Merchant identifier not configured correctly");
    strapi.log.error("[Apple Pay] 5. Apple Pay onboarding not completed");
    
    // Extract error details from Payone response
    const errorCode = sessionResponse.errorcode || sessionResponse.ErrorCode;
    const errorMessage = sessionResponse.errormessage || sessionResponse.ErrorMessage || sessionResponse.errortxt || sessionResponse.ErrorTxt;
    
    if (errorCode || errorMessage) {
      strapi.log.error("[Apple Pay] Payone error details:", {
        errorCode: errorCode,
        errorMessage: errorMessage
      });
      throw new Error(`Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : ''} ${errorMessage || 'Unknown error'}. Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay).`);
    } else {
      throw new Error(`Apple Pay session initialization failed with status: ${responseStatus || 'UNKNOWN'}. Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay).`);
    }
  } catch (error) {
    strapi.log.error("[Apple Pay] Merchant validation error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });

    // DO NOT return empty object - this causes Apple Pay to close the dialog
    // Instead, re-throw the error so the frontend can handle it properly
    // The error message will help the user understand what went wrong
    throw error;
  }
};

/**
 * Parse Payone response
 */
const parseResponse = (responseData, logger) => {
  if (typeof responseData === 'string') {
    // Parse form-encoded response
    const params = new URLSearchParams(responseData);
    const parsed = {};
    for (const [key, value] of params.entries()) {
      parsed[key] = value;
    }
    return parsed;
  }
  return responseData;
};

/**
 * Generate nonce for merchant session
 */
const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};


