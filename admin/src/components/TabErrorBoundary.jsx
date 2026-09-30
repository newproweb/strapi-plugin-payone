import * as React from "react";
import { Box, Typography } from "@strapi/design-system";

/**
 * Keeps an error in one tab from crashing the whole plugin page.
 * Resets itself when the user switches to another tab.
 */
export class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Payone Tab Error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { t } = this.props;
    const translate = (id, fallback) => (t ? t(id, fallback) : fallback);
    return (
      <Box padding={6} style={{ textAlign: "center" }}>
        <Typography variant="beta" textColor="danger600">
          {translate("error.tabError", "Something went wrong loading this tab.")}
        </Typography>
        <Typography variant="pi" textColor="neutral600" style={{ marginTop: "8px", display: "block" }}>
          {translate("error.tabErrorHint", "Try switching to another tab or reload the page.")}
        </Typography>
      </Box>
    );
  }
}
