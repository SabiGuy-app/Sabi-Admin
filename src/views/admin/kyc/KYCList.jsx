import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import { MdVerified, MdPending, MdCancel, MdFactCheck } from "react-icons/md";
import { userAPI } from "services/api";

const entityConfig = {
  providers: {
    label: "Providers",
    singular: "provider",
    role: "provider",
    fetch: userAPI.getServiceProviders,
  },
  users: {
    label: "Service Users",
    singular: "user",
    role: "buyer",
    fetch: userAPI.getServiceUsers,
  },
};

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

const getPaginationMeta = (data, count, currentPage, itemsPerPage) => {
  const meta = data?.pagination || data?.meta || {};
  const totalCount =
    meta?.totalItems ??
    meta?.total ??
    meta?.count ??
    data?.totalItems ??
    data?.total ??
    data?.count ??
    count;
  const totalPages =
    meta?.totalPages ||
    (typeof totalCount === "number" ? Math.ceil(totalCount / itemsPerPage) : 0);

  return {
    totalItems: typeof totalCount === "number" ? totalCount : 0,
    totalPages,
    hasNext:
      totalPages > 0 ? currentPage < totalPages : count === itemsPerPage,
  };
};

const KYCList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [entityType, setEntityType] = useState("providers");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentEntity = entityConfig[entityType];

  useEffect(() => {
    const fetchKYCRecords = async () => {
      try {
        setLoading(true);
        const data = await currentEntity.fetch(currentPage, itemsPerPage);
        const list = getListFromResponse(data).filter(
          (item) => !currentEntity.role || item.role === currentEntity.role
        );

        const mappedRecords = list.map((record) => ({
          id: record._id,
          name: record.fullName || "N/A",
          email: record.email,
          phone: record.phoneNumber,
          kycStatus: record.kycVerified
            ? "verified"
            : record.kycCompleted || record.ninSlip
            ? "pending"
            : "incomplete",
          kycLevel: record.kycLevel || 0,
          kycVerified: Boolean(record.kycVerified),
          kycCompleted: Boolean(record.kycCompleted || record.ninSlip),
          profilePicture: record.profilePicture,
          createdAt: record.createdAt
            ? new Date(record.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          rawData: record,
        }));

        const pagination = getPaginationMeta(
          data,
          list.length,
          currentPage,
          itemsPerPage
        );

        setRecords(mappedRecords);
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
        setHasNext(pagination.hasNext);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${currentEntity.label}:`, err);
        setError(err.message);
        setRecords([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCRecords();
  }, [currentEntity, currentPage]);

  const displayData = useMemo(() => {
    switch (activeTab) {
      case "verified":
        return records.filter((record) => record.kycVerified);
      case "pending":
        return records.filter(
          (record) => record.kycCompleted && !record.kycVerified
        );
      case "incomplete":
        return records.filter((record) => !record.kycCompleted);
      case "all":
      default:
        return records;
    }
  }, [activeTab, records]);

  const handleEntityChange = (nextEntityType) => {
    setEntityType(nextEntityType);
    setActiveTab("all");
    setCurrentPage(1);
  };

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

  const handleViewKYC = (record) => {
    navigate(`/admin/kyc-details/${record.id}?type=${entityType}`, {
      state: { entityType, provider: record.rawData },
    });
  };

  const TableRow = ({ record }) => (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={
              record.profilePicture ||
              `https://i.pravatar.cc/150?u=${record.email}`
            }
            alt={record.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {record.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {record.email}
            </p>
          </div>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {record.phone || "N/A"}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="text-sm">
          <p className="font-medium text-navy-700 dark:text-white">
            Level {record.kycLevel}
          </p>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
              record.kycStatus
            )}`}
          >
            {getStatusIcon(record.kycStatus)}
            {record.kycStatus}
          </span>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {record.createdAt}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <button
          onClick={() => handleViewKYC(record)}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
        >
          Review {entityType === "users" ? "NIN" : "KYC"}
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
        KYC & Verification
      </h3>

      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {Object.entries(entityConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleEntityChange(key)}
              className={`px-4 pb-3 font-medium transition-all ${
                entityType === key
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading {currentEntity.label.toLowerCase()}...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading {currentEntity.label.toLowerCase()}: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "all"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                All ({records.length})
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
                {records.filter((p) => p.kycCompleted && !p.kycVerified).length}
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
                Verified ({records.filter((p) => p.kycVerified).length})
              </button>
              <button
                onClick={() => handleTabChange("incomplete")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "incomplete"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Incomplete ({records.filter((p) => !p.kycCompleted).length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30">
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {entityType === "users" ? "User" : "Provider"}
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
                    displayData.map((record) => (
                      <TableRow key={record.id} record={record} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No {currentEntity.label.toLowerCase()} found
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
                  {currentEntity.label.toLowerCase()}
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
