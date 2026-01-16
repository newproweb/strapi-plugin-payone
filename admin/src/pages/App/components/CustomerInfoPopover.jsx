import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@strapi/design-system";

const CustomerInfoPopover = ({ transaction, children }) => {
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
        const spaceBelow = parentRect.bottom - buttonRect.bottom;
        // If there's less space above than below (or less than 200px), show popover below
        return spaceAbove < 200 || spaceAbove < spaceBelow ? "bottom" : "top";
      }
      scrollableParent = scrollableParent.parentElement;
    }
    // Fallback: use viewport space
    const spaceAbove = buttonRect.top;
    return spaceAbove < 200 ? "bottom" : "top";
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

  const rawRequest = transaction?.raw_request || {};
  const salutation = rawRequest.salutation || "";
  const firstname = rawRequest.firstname || "";
  const lastname = rawRequest.lastname || "";
  const street = rawRequest.street || "";
  const zip = rawRequest.zip || "";
  const city = rawRequest.city || "";
  const telephonenumber = rawRequest.telephonenumber || "";
  const email = rawRequest.email || "";

  const hasCustomerInfo =
    salutation ||
    firstname ||
    lastname ||
    street ||
    zip ||
    city ||
    telephonenumber ||
    email;

  if (!hasCustomerInfo) {
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
            minWidth: "250px",
            maxWidth: "350px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--strapi-colors-neutral200)",
          }}
        >
          <Box paddingBottom={2}>
            <Typography variant="pi" fontWeight="bold" textColor="neutral800">
              👤 {[salutation, firstname, lastname].filter(Boolean).join(" ")}
            </Typography>
          </Box>
          {(street || zip || city) && (
            <Box paddingBottom={2}>
              <Typography variant="pi" textColor="neutral800">
                📍 {[street, zip, city].filter(Boolean).join(" ")}
              </Typography>
            </Box>
          )}
          {telephonenumber && (
            <Box paddingBottom={2}>
              <Typography variant="pi" textColor="neutral800">
                📞 {telephonenumber}
              </Typography>
            </Box>
          )}
          {email && (
            <Box>
              <Typography variant="pi" textColor="neutral800">
                ✉️ {email}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomerInfoPopover;

