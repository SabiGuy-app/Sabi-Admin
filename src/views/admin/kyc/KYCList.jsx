import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import { MdVerified, MdPending, MdCancel, MdFactCheck } from "react-icons/md";
import { userAPI } from "services/api";

const KYCList = () => {
  const navigate = useNavigate();
  const [allProviders, setAllProviders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        // Fetch providers with KYC data
        const data = await userAPI.getServiceProviders(
          currentPage,
          itemsPerPage
        );

        console.log("API Response:", data);

        // Handle different response structures
        const providersArray = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        console.log("Providers Array:", providersArray);
        console.log("Providers Count:", providersArray.length);

        if (providersArray.length === 0) {
          console.log("No providers found in response");
          setAllProviders([]);
          return;
        }

        // Map API response to our table format
        const mappedProviders = providersArray.map((provider) => ({
          id: provider._id,
          name: provider.fullName || "N/A",
          email: provider.email,
          phone: provider.phoneNumber,
          kycStatus: provider.kycVerified
            ? "verified"
            : provider.kycCompleted
            ? "pending"
            : "incomplete",
          kycLevel: provider.kycLevel || 0,
          kycVerified: provider.kycVerified || false,
          kycCompleted: provider.kycCompleted || false,
          profilePicture: provider.profilePicture,
          createdAt: new Date(provider.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          rawData: provider,
        }));

        console.log("Mapped Providers:", mappedProviders);

        const meta = data?.pagination || data?.meta || {};
        const totalCount =
          meta?.totalItems ??
          meta?.total ??
          meta?.count ??
          data?.totalItems ??
          data?.total ??
          data?.count ??
          providersArray.length;
        const computedTotalPages =
          meta?.totalPages ||
          (typeof totalCount === "number"
            ? Math.ceil(totalCount / itemsPerPage)
            : 0);

        setAllProviders(mappedProviders);
        setTotalItems(typeof totalCount === "number" ? totalCount : 0);
        setTotalPages(computedTotalPages);
        setHasNext(
          computedTotalPages > 0
            ? currentPage < computedTotalPages
            : providersArray.length === itemsPerPage
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching providers:", err);
        setError(err.message);
        setAllProviders([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [currentPage]);

  const getFilteredData = () => {
    switch (activeTab) {
      case "verified":
        return allProviders.filter((p) => p.kycVerified);
      case "pending":
        return allProviders.filter((p) => p.kycCompleted && !p.kycVerified);
      case "incomplete":
        return allProviders.filter((p) => !p.kycCompleted);
      case "all":
      default:
        return allProviders;
    }
  };

  const displayData = useMemo(
    () => getFilteredData(),
    [activeTab, allProviders]
  );
  const pageData = useMemo(() => displayData, [displayData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "incomplete":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <MdVerified className="h-4 w-4" />;
      case "pending":
        return <MdPending className="h-4 w-4" />;
      case "incomplete":
        return <MdCancel className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleViewKYC = (provider) => {
    navigate(`/admin/kyc-details/${provider.id}`, {
      state: { provider: provider.rawData },
    });
  };

  const TableRow = ({ provider }) => (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={
              provider.profilePicture ||
              `https://i.pravatar.cc/150?u=${provider.email}`
            }
            alt={provider.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {provider.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {provider.email}
            </p>
          </div>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {provider.phone || "N/A"}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="text-sm">
          <p className="font-medium text-navy-700 dark:text-white">
            Level {provider.kycLevel}
          </p>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
              provider.kycStatus
            )}`}
          >
            {getStatusIcon(provider.kycStatus)}
            {provider.kycStatus}
          </span>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {provider.createdAt}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <button
          onClick={() => handleViewKYC(provider)}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
        >
          Review KYC
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <h3 className="mb-6 mt-4 flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
          <MdFactCheck className="h-6 w-6 text-white" />
        </div>
      </h3>
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading providers...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading providers: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "all"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                All ({allProviders.length})
              </button>
              <button
                onClick={() => handleTabChange("pending")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "pending"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Pending Review (
                {
                  allProviders.filter((p) => p.kycCompleted && !p.kycVerified)
                    .length
                }
                )
              </button>
              <button
                onClick={() => handleTabChange("verified")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "verified"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Verified ({allProviders.filter((p) => p.kycVerified).length})
              </button>
              <button
                onClick={() => handleTabChange("incomplete")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "incomplete"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Incomplete ({allProviders.filter((p) => !p.kycCompleted).length}
                )
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30">
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Provider
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Phone
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        KYC Status
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Date Joined
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Action
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.length > 0 ? (
                    pageData.map((provider) => (
                      <TableRow key={provider.id} provider={provider} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No providers found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {displayData.length > 0 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + displayData.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {totalItems > 0 ? totalItems : "many"}
                  </span>{" "}
                  providers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() =>
                      setCurrentPage((p) =>
                        totalPages > 0 ? Math.min(totalPages, p + 1) : p + 1
                      )
                    }
                    disabled={!hasNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default KYCList;
