import * as React from "react";
import { usePayoneApi } from "../../api/payone.api";

const EMPTY_STATS = { total: 0, approved: 0, error: 0, redirect: 0 };

/** Status totals for the current filters; `reloadKey` lets the caller refresh them after an import. */
export const useTransactionStats = (filters, reloadKey) => {
  const { getTransactionStats } = usePayoneApi();
  const [stats, setStats] = React.useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    getTransactionStats(filters)
      .then((response) => isCurrent && setStats({ ...EMPTY_STATS, ...(response?.data?.data || {}) }))
      .catch(() => isCurrent && setStats(EMPTY_STATS))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [filters.search, filters.request_type, filters.payment_method, filters.date_from, filters.date_to, reloadKey]);

  return { stats, isLoading };
};
