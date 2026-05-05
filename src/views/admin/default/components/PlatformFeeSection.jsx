import Card from "components/card";
import { MdPayments, MdAccountBalanceWallet, MdReceiptLong } from "react-icons/md";

const PlatformFeeSection = ({ report, balance, loading }) => {
  const formatCurrency = (value) => {
    if (typeof value !== "number") return "N/A";
    return `NGN ${value.toLocaleString("en-NG")}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reportItems = Array.isArray(report)
    ? report
    : Array.isArray(report?.data)
    ? report.data
    : report
    ? [report]
    : [];

  const balanceData = balance?.data?.balance || balance?.balance || balance || {};
  const revenueData = balance?.data?.revenue || balance?.revenue || {};

  const statCards = [
    { label: "Available", value: balanceData.available },
    { label: "Pending", value: balanceData.pending },
    { label: "Total", value: balanceData.total },
    { label: "Platform Fee", value: balanceData.platformFeeCollected },
    { label: "Provider Commission", value: balanceData.providerCommissionCollected },
    { label: "Tax Collected", value: balanceData.taxCollected },
  ];

  return (
    <Card extra="w-full p-6 mt-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <MdAccountBalanceWallet className="h-4 w-4" />
            Platform Fee
          </div>
          <h3 className="text-2xl font-bold text-navy-700 dark:text-white">
            Platform Fee Report
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Revenue summary and booking-level fee breakdowns
          </p>
        </div>
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-right dark:bg-brand-900/20">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Source
          </p>
          <p className="text-sm font-semibold text-navy-700 dark:text-white">
            {balance?.data?.source || balance?.source || "platform-fee-report"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
              {loading ? "Loading..." : formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Platform Fee Collected
          </p>
          <p className="mt-2 text-lg font-bold text-navy-700 dark:text-white">
            {loading
              ? "Loading..."
              : formatCurrency(
                  revenueData.totalPlatformFeeCollected ||
                    balanceData.totalPlatformFeeCollected
                )}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Collected Including Tax
          </p>
          <p className="mt-2 text-lg font-bold text-navy-700 dark:text-white">
            {loading
              ? "Loading..."
              : formatCurrency(
                  revenueData.totalCollectedIncludingTax ||
                    balanceData.totalCollectedIncludingTax
                )}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Provider Commission Collected
          </p>
          <p className="mt-2 text-lg font-bold text-navy-700 dark:text-white">
            {loading
              ? "Loading..."
              : formatCurrency(
                  revenueData.providerCommissionCollected ||
                    balanceData.providerCommissionCollected
                )}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tax Collected
          </p>
          <p className="mt-2 text-lg font-bold text-navy-700 dark:text-white">
            {loading
              ? "Loading..."
              : formatCurrency(revenueData.taxCollected || balanceData.taxCollected)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <MdPayments className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Fee Breakdown
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recent platform fee report entries
            </p>
          </div>
        </div>

        {reportItems.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Platform Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Driver Receives
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportItems.map((item) => (
                  <tr
                    key={item._id || item.bookingId}
                    className="border-t border-gray-100 dark:border-gray-700"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {item.serviceType || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.subCategory || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {item.user?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.user?.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {item.provider?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.provider?.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {item.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(
                        item.feeBreakdown?.totalPlatformFee ||
                          item.pricingBreakdown?.platformFee ||
                          item.pricingBreakdown?.platformEarns
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(
                        item.feeBreakdown?.providerReceives ||
                          item.pricingBreakdown?.driverReceives
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
            <MdReceiptLong className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              No platform fee report data available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlatformFeeSection;
