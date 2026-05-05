import React, { useEffect, useState } from "react";
import { MdAccountBalanceWallet, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PlatformFeeSection from "views/admin/default/components/PlatformFeeSection";
import { dashboardAPI } from "services/api";

const PlatformFeePage = () => {
  const navigate = useNavigate();
  const [platformFeeReport, setPlatformFeeReport] = useState(null);
  const [platformBalance, setPlatformBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlatformFeeData = async () => {
      try {
        setLoading(true);
        const [reportData, balanceData] = await Promise.all([
          dashboardAPI.getPlatformFeeReport(),
          dashboardAPI.getPlatformBalance(),
        ]);

        setPlatformFeeReport(reportData?.data || reportData || []);
        setPlatformBalance(balanceData?.data || balanceData || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching platform fee data:", err);
        setError(err.message);
        setPlatformFeeReport([]);
        setPlatformBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformFeeData();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl p-2">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <MdArrowBack className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-r from-brand-500 via-blue-600 to-cyan-700 p-6 text-white shadow-xl">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <MdAccountBalanceWallet className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Platform Fee</h2>
              <p className="mt-1 text-sm text-white/80">
                Monitor platform fee collection, commissions, and tax totals
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-100 p-4">
          <p className="text-red-700">Platform fee error: {error}</p>
        </div>
      )}

      <PlatformFeeSection
        report={platformFeeReport}
        balance={platformBalance}
        loading={loading}
      />
    </div>
  );
};

export default PlatformFeePage;
