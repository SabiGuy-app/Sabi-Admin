import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import avatar from "assets/img/avatars/avatar.png";
import { MdModeEditOutline, MdAccountCircle } from "react-icons/md";
import { userAPI } from "services/api";

const ServiceProviders = () => {
  const navigate = useNavigate();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [activeTab, setActiveTab] = useState("providers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "N/A"
      : parsed.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetcher =
          activeTab === "online"
            ? userAPI.getOnlineProviders
            : userAPI.getServiceProviders;
        const data = await fetcher(currentPage, itemsPerPage);
        const list = data?.data || data || [];

        const mappedUsers =
          activeTab === "online"
            ? list.map((user) => ({
                id: user._id,
                name: user.fullName || "N/A",
                email: user.email,
                role: "Online Provider",
                status: user.online ? "Online" : "Offline",
                dateJoined: formatDate(user.lastLocationUpdate || user.createdAt),
                avatar: user.profilePicture || avatar,
                phone: user.phoneNumber,
                city: user.city,
                address: user.address || user.currentLocation?.address,
                gender: user.gender,
                accountType: user.accountType,
                allowAnywhere: user.allowAnywhere,
                accountNumber: user.accountNumber,
                bankCode: user.bankCode,
                bankName: user.bankName,
                accountName: user.accountName,
                driverLicenseNumber: user.driverLicenseNumber,
                vehicleName: user.vehicleName,
                vehicleColor: user.vehicleColor,
                vehicleRegNo: user.vehicleRegNo,
                ninSlip: user.ninSlip,
                emailVerified: user.emailVerified,
                isGoogleUser: user.isGoogleUser,
                googleId: user.googleId,
                files: user.files,
                currentLocation: user.currentLocation,
                availability: user.availability,
                rating: user.rating,
                completedJobs: user.completedJobs,
                service: user.service,
                job: user.job,
                workVisuals: user.workVisuals,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                refreshTokenExpiresAt: user.refreshTokenExpiresAt,
                notificationPreferences: user.notificationPreferences,
                kycCompleted: user.kycCompleted,
                kycLevel: user.kycLevel,
                kycVerified: user.kycVerified,
                totalBookings: user.completedJobs || 0,
                lastLocationUpdate: user.lastLocationUpdate,
                online: user.online,
                locationFresh: user.locationFresh,
                locationAgeMinutes: user.locationAgeMinutes,
              }))
            : list
                .filter((user) => user.role === "provider")
                .map((user) => ({
                  id: user._id,
                  name: user.fullName || "N/A",
                  email: user.email,
                  role: "Service Provider",
                  status: user.emailVerified ? "Active" : "Pending",
                  dateJoined: formatDate(user.createdAt),
                  avatar: user.profilePicture || avatar,
                  phone: user.phoneNumber,
                  city: user.city,
                  address: user.address,
                  gender: user.gender,
                  accountType: user.accountType,
                  allowAnywhere: user.allowAnywhere,
                  accountNumber: user.accountNumber,
                  bankCode: user.bankCode,
                  bankName: user.bankName,
                  accountName: user.accountName,
                  driverLicenseNumber: user.driverLicenseNumber,
                  vehicleName: user.vehicleName,
                  vehicleColor: user.vehicleColor,
                  vehicleRegNo: user.vehicleRegNo,
                  ninSlip: user.ninSlip,
                  emailVerified: user.emailVerified,
                  isGoogleUser: user.isGoogleUser,
                  googleId: user.googleId,
                  files: user.files,
                  currentLocation: user.currentLocation,
                  availability: user.availability,
                  rating: user.rating,
                  completedJobs: user.completedJobs,
                  service: user.service,
                  job: user.job,
                  workVisuals: user.workVisuals,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                  refreshTokenExpiresAt: user.refreshTokenExpiresAt,
                  notificationPreferences: user.notificationPreferences,
                  kycCompleted: user.kycCompleted,
                  kycLevel: user.kycLevel,
                  kycVerified: user.kycVerified,
                  totalBookings: user.bookingsCount || 0,
                }));

        setServiceProviders(mappedUsers);
        const meta = data?.pagination || data?.meta || {};
        const totalItems =
          meta?.totalItems ??
          meta?.total ??
          meta?.count ??
          data?.totalItems ??
          data?.total ??
          data?.count ??
          null;
        const computedTotalPages =
          meta?.totalPages ||
          (typeof totalItems === "number"
            ? Math.ceil(totalItems / itemsPerPage)
            : 0);
        setTotalPages(computedTotalPages);
        setHasNext(
          computedTotalPages > 0
            ? currentPage < computedTotalPages
            : list.length === itemsPerPage
        );
        setError(null);
      } catch (err) {
        setError(err.message);
        setServiceProviders([]);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, currentPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Online":
        return "bg-green-100 text-green-700";
      case "Inactive":
      case "Offline":
        return "bg-red-100 text-red-700";
      case "Pending":
      case "Unavailable":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Service Provider":
        return "bg-brand-100 text-brand-700";
      case "Service User":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatJobTitle = (title) => {
    if (!title) return "No job";
    return title
      .toString()
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return "N/A";
    const [lng, lat] = coordinates;
    return `${lat}, ${lng}`;
  };

  const handleViewDetails = (user) => {
    navigate(`/admin/user-details/${user.id}`, { state: { user } });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const TableRow = ({ user }) => (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <p className="text-sm font-medium text-navy-700 dark:text-white">
            {user.name}
          </p>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {formatJobTitle(user.job?.[0]?.title)}
        </span>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
            user.status
          )}`}
        >
          {user.status}
        </span>
      </td>
       <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.totalBookings}
        </p>
      </td>
      {activeTab === "online" && (
        <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <div className="max-w-xs">
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {user.currentLocation?.address || "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Coordinates: {formatCoordinates(user.currentLocation?.coordinates)}
            </p>
          </div>
        </td>
      )}
      {activeTab === "online" && (
        <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <div className="max-w-xs">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                user.availability?.isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.availability?.isAvailable ? "Available" : "Unavailable"}
            </span>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Updated: {formatDate(user.availability?.lastUpdated)}
            </p>
          </div>
        </td>
      )}
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.dateJoined}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <button
          onClick={() => handleViewDetails(user)}
          className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
        >
          <MdModeEditOutline className="h-4 w-4" />
          View Details
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <h3 className="mb-6 flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
        <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
          <MdAccountCircle className="h-6 w-6 text-white" />
        </div>
        <span>{activeTab === "online" ? "Online Providers" : "Service Providers"}</span>
      </h3>
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-green-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading {activeTab === "online" ? "online providers" : "service providers"}...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading {activeTab === "online" ? "online providers" : "service providers"}: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleTabChange("providers")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "providers"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Service Providers
              </button>
              <button
                onClick={() => handleTabChange("online")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "online"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Online Providers
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-brand-50 dark:from-blue-900/30 dark:to-brand-900/30">
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Name
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Email
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Service
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Status
                      </p>
                    </th>
                    {activeTab === "online" && (
                      <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                          Location
                        </p>
                      </th>
                    )}
                    {activeTab === "online" && (
                      <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                          Availability
                        </p>
                      </th>
                    )}
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Bookings
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {activeTab === "online" ? "Last Location Update" : "Date Joined"}
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
                  {serviceProviders.length > 0 ? (
                    serviceProviders.map((user) => (
                      <TableRow key={user.id} user={user} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeTab === "online" ? 9 : 7} className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No {activeTab === "online" ? "online providers" : "service providers"} found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {serviceProviders.length > 0 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {Math.min(
                      (currentPage - 1) * itemsPerPage +
                        serviceProviders.length,
                      totalPages > 0 ? totalPages * itemsPerPage : Infinity
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {totalPages > 0 ? totalPages * itemsPerPage : "many"}
                  </span>{" "}
                  {activeTab === "online" ? "providers" : "users"}
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
                    Page {currentPage} of {totalPages}
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

export default ServiceProviders;
