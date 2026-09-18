import * as React from "react";
import { Box } from "@strapi/design-system";

const CodeBlock = ({ children }) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const rgb = bodyBg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const brightness =
            (parseInt(rgb[0]) * 299 +
              parseInt(rgb[1]) * 587 +
              parseInt(rgb[2]) * 114) /
            1000;
          setIsDark(brightness < 128);
        } else {
          const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          setIsDark(prefersDark);
        }
      }
    };

    checkTheme();
    const mediaQuery =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery) {
      mediaQuery.addEventListener("change", checkTheme);
      return () => mediaQuery.removeEventListener("change", checkTheme);
    }
  }, []);

  return (
    <Box
      padding={3}
      borderRadius="4px"
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#f6f6f9",
        color: isDark ? "#d4d4d4" : "#32324d",
        fontFamily: "monospace",
        fontSize: "14px",
        overflow: "auto",
      }}
    >
      <pre
        style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {children}
      </pre>
    </Box>
  );
};

export default CodeBlock;

