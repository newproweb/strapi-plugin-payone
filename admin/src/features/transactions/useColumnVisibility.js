import * as React from "react";

const ALWAYS_VISIBLE = "details";

const initialVisibility = (headers, previous = {}) =>
  Object.fromEntries(headers.map((header) => [header.name, previous[header.name] ?? !header.hiddenByDefault]));

const allVisible = (headers) => Object.fromEntries(headers.map((header) => [header.name, true]));

/** Show/hide table columns; the details column always stays and at least one other column remains visible. */
export const useColumnVisibility = (headers) => {
  const [visibleColumns, setVisibleColumns] = React.useState(() => initialVisibility(headers));

  React.useEffect(() => {
    setVisibleColumns((prev) => initialVisibility(headers, prev));
  }, [headers]);

  const toggleableHeaders = React.useMemo(() => headers.filter((header) => header.name !== ALWAYS_VISIBLE), [headers]);
  const visibleHeaders = React.useMemo(() => headers.filter((header) => visibleColumns[header.name]), [headers, visibleColumns]);

  const toggleColumn = (key) => {
    if (key === ALWAYS_VISIBLE) return;
    setVisibleColumns((prev) => {
      const visibleCount = toggleableHeaders.filter((header) => prev[header.name]).length;
      if (prev[key] && visibleCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const showAllColumns = () => setVisibleColumns(allVisible(headers));

  return { visibleColumns, toggleableHeaders, visibleHeaders, toggleColumn, showAllColumns };
};
