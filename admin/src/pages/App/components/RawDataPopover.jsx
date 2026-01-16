import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@strapi/design-system";
import JsonView from "@uiw/react-json-view";

const RawDataPopover = ({ transaction, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState("top"); // 'top' or 'bottom'
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const calculatePosition = (buttonElement) => {
    if (!buttonElement) return "top";
    
    const buttonRect = buttonElement.getBoundingClientRect();
    // Find the scrollable parent container
    let scrollableParent = buttonElement.parentElement;
    while (scrollableParent && scrollableParent !== document.body) {
      const style = window.getComputedStyle(scrollableParent);
      if (style.overflow === 'auto' || style.overflowY === 'auto' || style.overflow === 'scroll' || style.overflowY === 'scroll') {
        const parentRect = scrollableParent.getBoundingClientRect();
        const spaceAbove = buttonRect.top - parentRect.top;
        const spaceBelow = parentRect.bottom - parentRect.bottom;
        // RawDataPopover can be up to 500px tall, so we need more space
        // If there's less space above than below (or less than 520px), show popover below
        return spaceAbove < 520 || spaceAbove < spaceBelow ? "bottom" : "top";
      }
      scrollableParent = scrollableParent.parentElement;
    }
    // Fallback: use viewport space
    const spaceAbove = buttonRect.top;
    return spaceAbove < 520 ? "bottom" : "top";
  };

  const handleButtonClick = () => {
    if (!isOpen && buttonRef.current) {
      // Calculate position before opening
      const newPosition = calculatePosition(buttonRef.current);
      setPosition(newPosition);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  if (!transaction) {
    return children;
  }

  return (
    <Box position="relative" style={{ display: "inline-block" }}>
      <Box
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{ display: "inline-block" }}
      >
        {children}
      </Box>
      {isOpen && (
        <Box
          ref={popoverRef}
          position="absolute"
          zIndex={1000}
          left={0}
          {...(position === "top" 
            ? { bottom: "100%", marginBottom: 2 }
            : { top: "100%", marginTop: 2 }
          )}
          padding={3}
          background="neutral0"
          hasRadius
          style={{
            minWidth: "400px",
            maxWidth: "600px",
            maxHeight: "500px",
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--strapi-colors-neutral200)",
          }}
        >
          <Box paddingBottom={2}>
            <Typography variant="pi" fontWeight="bold" textColor="neutral800">
              Raw Transaction Data
            </Typography>
          </Box>
          <Box>
            <JsonView value={transaction} style={{ fontSize: "12px" }} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RawDataPopover;

