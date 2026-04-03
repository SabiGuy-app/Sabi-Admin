import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import { MdModeEditOutline, MdLocalShipping } from "react-icons/md";
import { bookingsAPI } from "services/api";

const AllBookings = () => {
  const navigate = useNavigate();
  const [allBookings, setAllBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 20;
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: itemsPerPage,
  });
  const [stats, setStats] = useState({});

  const toTitleCase = (value) => {
    if (!value) return "N/A";
    return value
      .toString()
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingsAPI.getBookings(
          currentPage,
          itemsPerPage,
          sortBy,
          sortOrder
        );

        // Map API response to our table format
        const list = data?.data || data || [];
        const mappedBookings = list.map((booking) => ({
          id: booking._id,
          userId: booking.userId._id,
          userName: booking.userId.fullName || "N/A",
          userEmail: booking.userId.email,
          userPhone: booking.userId.phoneNumber,
          serviceType: booking.serviceType,
          subCategory: booking.subCategory,
          pickupLocation: booking.pickupLocation.address,
          dropoffLocation: booking.dropoffLocation.address,
          distance: `${booking.distance.value} ${booking.distance.unit}`,
          duration: `${booking.estimatedDuration.value} ${booking.estimatedDuration.unit}`,
          agreedPrice: booking.agreedPrice,
          calculatedPrice: booking.calculatedPrice,
          status: booking.status,
          providerResponse: booking.providerResponse,
          modeOfDelivery: booking.modeOfDelivery,
          createdAt: new Date(booking.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          providerId: booking.providerId?._id || null,
          providerName: booking.providerId?.fullName || "N/A",
          rawData: booking,
        }));

        setAllBookings(mappedBookings);
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
        setPaginationMeta({
          total: meta?.total ?? totalItems ?? list.length,
          totalPages: meta?.totalPages ?? computedTotalPages,
          currentPage: meta?.currentPage ?? currentPage,
          perPage: meta?.perPage ?? itemsPerPage,
        });
        setStats(data?.stats || {});
        setError(null);
      } catch (err) {
        setError(err.message);
        setAllBookings([]);
        setTotalPages(0);
        setHasNext(false);
        setPaginationMeta({
          total: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: itemsPerPage,
        });
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    const statusColors = {
      pending_providers: "bg-yellow-100 text-yellow-700",
      provider_selected: "bg-blue-100 text-blue-700",
      paid_escrow: "bg-purple-100 text-purple-700",
      in_transit: "bg-cyan-100 text-cyan-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      pending: "bg-orange-100 text-orange-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };



  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400">⇅</span>;
    return sortOrder === "desc" ? <span>↓</span> : <span>↑</span>;
  };

  const TableRow = ({ booking }) => (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {booking.userName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {booking.userEmail}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">{toTitleCase(booking.serviceType)}</p>
          <p className="text-xs">{toTitleCase(booking.subCategory)}</p>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">From: {booking.pickupLocation}</p>
          <p className="font-medium">To: {booking.dropoffLocation}</p>
          {/* <p className="mt-1 text-xs">
            {booking.distance} • {booking.duration}
          </p> */}
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="text-sm">
          <p className="font-medium text-navy-700 dark:text-white">
            ₦{booking.agreedPrice.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mode: {booking.modeOfDelivery}
          </p>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status.replace(/_/g, " ")}
        </span>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        {booking.providerId ? (
          <div className="text-sm">
            <p className="font-medium text-navy-700 dark:text-white">
              {booking.providerName}
            </p>
          
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        )}
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          {booking.createdAt}
        </p>
        {/* <button
          onClick={() => handleViewDetails(booking)}
          className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
        >
          <MdModeEditOutline className="h-4 w-4" />
          Details
        </button> */}
      </td>
    </tr>
  );

  return (
    <div>
      <h3 className="mb-6 mt-4 flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
          <MdLocalShipping className="h-6 w-6 text-white" />
        </div>
      </h3>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card extra="w-full p-4">
          <p className="text-xs font-medium uppercase text-gray-500">
            Total Bookings
          </p>
          <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
            {paginationMeta.total}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Page {paginationMeta.currentPage} of {paginationMeta.totalPages || 1}
          </p>
        </Card>
        <Card extra="w-full p-4">
          <p className="text-xs font-medium uppercase text-gray-500">
            Completed
          </p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.completed ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Finished jobs
          </p>
        </Card>
        <Card extra="w-full p-4">
          <p className="text-xs font-medium uppercase text-gray-500">
            Paid Escrow
          </p>
          <p className="mt-1 text-2xl font-bold text-purple-600">
            {stats.paid_escrow ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Escrow funded
          </p>
        </Card>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Object.entries(stats)
            .filter(([key]) => !["completed", "paid_escrow"].includes(key))
            .map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-navy-800 dark:text-gray-200"
              >
                <div className="font-semibold text-navy-700 dark:text-white">
                  {toTitleCase(key)}
                </div>
                <div className="text-lg font-bold text-brand-500">
                  {value}
                </div>
              </div>
            ))}
        </div>
      )}
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading bookings...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading bookings: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30">
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        User
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Service Type
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Route & Distance
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Price
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-brand-500 dark:text-white"
                      >
                        Status
                        <SortIcon field="status" />
                      </button>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Provider
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-brand-500 dark:text-white"
                      >
                        Created
                        <SortIcon field="createdAt" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.length > 0 ? (
                    allBookings.map((booking) => (
                      <TableRow key={booking.id} booking={booking} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No bookings found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {allBookings.length > 0 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + allBookings.length}
                  </span>
                  {" "}of{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {totalPages > 0 ? totalPages * itemsPerPage : "many"}
                  </span>
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

export default AllBookings;

