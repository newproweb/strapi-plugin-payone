import { Alert, Box, Link, Typography } from "@strapi/design-system";
import { pluginId } from "../../../pluginId";
import { APPLE_PAY_DOCS_URL, APPLE_PAY_DOMAIN_FILE_PATH } from "../../../constants/apple-pay";

const NOTICE_BOX_STYLE = { background: "transparent", padding: "16px", borderRadius: "4px", border: "1px solid #eaeaea" };
const MONO_TEXT_STYLE = { fontFamily: "monospace", fontSize: "12px", lineHeight: "1.8" };
const CONFIG_LINK_STYLE = { cursor: "pointer", textDecoration: "underline", color: "#0066ff" };

const ConfigLink = ({ label, path, view, onNavigateToConfig, boxProps }) => (
  <Box padding={3} {...boxProps}>
    <Typography variant="pi" textColor="neutral600">
      {label}{" "}
      <Link
        href={`/plugins/${pluginId}/${path}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigateToConfig(view);
        }}
        style={CONFIG_LINK_STYLE}
      >
        /plugins/{pluginId}/{path}
      </Link>
    </Typography>
  </Box>
);

const renderAppleCspNotice = () => (
  <Box style={NOTICE_BOX_STYLE}>
    <Typography variant="pi" style={{ lineHeight: "1.6" }}>
      <strong>Apple Pay requires middleware configuration</strong> to work properly. You must configure Content Security Policy
      (CSP) in <code style={{ padding: "2px 6px", borderRadius: "3px", fontSize: "13px" }}>config/middlewares.js</code> to allow
      Apple Pay scripts.
    </Typography>
    <Box style={{ marginTop: "16px" }}>
      <Typography variant="pi" style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
        Required CSP directives:
      </Typography>
      <Box>
        <Typography variant="pi" style={MONO_TEXT_STYLE}>
          <div>'script-src': ['https://applepay.cdn-apple.com', 'https://www.apple.com']</div>
          <div>'connect-src': ['https://applepay.cdn-apple.com', 'https://www.apple.com']</div>
          <div>'frame-src': ['https://applepay.cdn-apple.com']</div>
        </Typography>
      </Box>
    </Box>
    <Box padding={2} background="warning100" style={{ marginTop: "16px", borderRadius: "4px", borderLeft: "3px solid #f29d41" }}>
      <Typography variant="pi" style={{ fontWeight: "600" }}>
        ⚠️ Without this configuration, Apple Pay will NOT work!
      </Typography>
    </Box>
  </Box>
);

const renderAppleDomainNotice = () => (
  <Box style={NOTICE_BOX_STYLE}>
    <Typography variant="pi" style={{ lineHeight: "1.6" }}>
      <strong>Download the domain verification file</strong> from your Payone merchant portal and place it in the following
      locations:
    </Typography>
    <Box>
      <Typography variant="pi" style={MONO_TEXT_STYLE}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Strapi:</strong> <code>{APPLE_PAY_DOMAIN_FILE_PATH}</code>
        </div>
        <div>
          <strong>Frontend:</strong> <code>{APPLE_PAY_DOMAIN_FILE_PATH}</code>
        </div>
      </Typography>
    </Box>
    <Box style={{ marginTop: "16px" }}>
      <Typography variant="pi" style={{ lineHeight: "1.6" }}>
        <strong>Download URL:</strong> Get the domain verification file from Payone documentation:
      </Typography>
      <Box padding={2} background="primary100" style={{ marginTop: "8px", borderRadius: "4px" }}>
        <Link
          href={APPLE_PAY_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4945ff", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}
        >
          → {APPLE_PAY_DOCS_URL}
        </Link>
      </Box>
    </Box>
    <Box padding={2} background="danger100" style={{ marginTop: "16px", borderRadius: "4px", borderLeft: "3px solid #d02b20" }}>
      <Typography variant="pi" textColor="danger600" style={{ fontWeight: "600" }}>
        ⚠️ Without this file, Apple Pay will NOT work on your domain!
      </Typography>
    </Box>
  </Box>
);

export const ApplePaySetupNotice = ({ onNavigateToConfig }) => (
  <>
    <Box style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {renderAppleCspNotice()}
      {renderAppleDomainNotice()}
    </Box>
    <ConfigLink
      label="Configure Apple Pay settings:"
      path="apple-pay-config"
      view="apple-pay-config"
      onNavigateToConfig={onNavigateToConfig}
      boxProps={{ borderRadius: "4px" }}
    />
  </>
);

export const GooglePaySetupNotice = ({ onNavigateToConfig }) => (
  <>
    <Alert closeLabel="Close" title="⚠️ Important: Middleware Configuration Required" variant="warning">
      <Typography variant="pi" marginTop={2}>
        <strong>Google Pay requires middleware configuration</strong> to work properly. You must configure Content Security
        Policy (CSP) in <code>config/middlewares.js</code> to allow Google Pay scripts, otherwise Google Pay will NOT work.
      </Typography>
      <Typography variant="pi" marginTop={2}>
        Required CSP directives for Google Pay:
      </Typography>
      <Box marginTop={2} padding={2} background="neutral100" borderRadius="4px">
        <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
          'script-src': ['https://pay.google.com']
          <br />
          'connect-src': ['https://pay.google.com']
          <br />
          'frame-src': ['https://pay.google.com']
        </Typography>
      </Box>
      <Typography variant="pi" marginTop={2} fontWeight="bold">
        ⚠️ Without this configuration, Google Pay will NOT work!
      </Typography>
    </Alert>
    <ConfigLink
      label="Configure Google Pay settings:"
      path="google-pay-config"
      view="google-pay-config"
      onNavigateToConfig={onNavigateToConfig}
      boxProps={{ background: "neutral100", borderRadius: "4px" }}
    />
  </>
);
