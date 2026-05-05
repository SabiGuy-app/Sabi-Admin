import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdLocalShipping,
  MdModeEditOutline,
} from "react-icons/md";
import Card from "components/card";
import { bookingsAPI } from "services/api";

const ProviderBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isProviderRoute = location.pathname.includes("/provider-bookings/");
  const accountLabel = isProviderRoute ? "provider" : "user";
  const [account, setAccount] = useState(
    location.state?.provider || location.state?.user || null
  );
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = isProviderRoute
          ? await bookingsAPI.getBookingsByProviderId(id)
          : await bookingsAPI.getBookingsByUserId(id);
        const list = data?.data || data || [];
        setBookings(Array.isArray(list) ? list : []);
        if (!location.state?.provider && !location.state?.user) {
          setAccount(data?.provider || data?.user || null);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id, isProviderRoute, location.state]);

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

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "N/A";
    return `NGN ${value.toLocaleString("en-NG")}`;
  };

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

  const accountName =
    account?.fullName ||
    account?.name ||
    bookings[0]?.providerId?.fullName ||
    bookings[0]?.userId?.fullName ||
    (isProviderRoute ? "Provider" : "User");

  const handleViewBooking = (booking) => {
    navigate(`/admin/booking-details/${booking._id}`, {
      state: { booking },
    });
  };

  const BookingRow = ({ booking }) => (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {booking.userId?.fullName || "N/A"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {booking.userId?.email || "N/A"}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {toTitleCase(booking.serviceType)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {toTitleCase(booking.subCategory)}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {booking.pickupLocation?.address || "N/A"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {booking.dropoffLocation?.address || "N/A"}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatCurrency(booking.pricing?.riderPays || booking.pricingBreakdown?.riderPaysFinal)}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {toTitleCase(booking.status)}
        </span>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDateTime(booking.createdAt)}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <button
          onClick={() => handleViewBooking(booking)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
        >
          <MdModeEditOutline className="h-4 w-4" />
          View Details
        </button>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading {accountLabel} bookings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Card extra="w-full p-6">
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            Unable to load {accountLabel} bookings
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
          >
            <MdArrowBack className="h-4 w-4" />
            Back
          </button>
        </Card>
      </div>
    );
  }

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
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
              {account?.profilePicture ? (
                <img
              src={account.profilePicture}
              alt={accountName}
              className="h-20 w-20 rounded-2xl border-2 border-white/60 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/20 text-2xl font-bold">
              {accountName?.[0] || (isProviderRoute ? "P" : "U")}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{accountName}</h2>
            <p className="mt-1 text-sm text-white/80">
              {isProviderRoute ? "Provider" : "User"} bookings: {bookings.length}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                ID: {id}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {account?.email ||
                  bookings[0]?.providerId?.email ||
                  bookings[0]?.userId?.email ||
                  "No email"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <MdLocalShipping className="h-5 w-5" />
          </div>
              <div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {isProviderRoute ? "Provider Bookings" : "User Bookings"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isProviderRoute
                ? "All bookings assigned to this provider"
                : "All bookings created by this user"}
            </p>
          </div>
        </div>

        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30">
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Customer
                    </p>
                  </th>
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Service
                    </p>
                  </th>
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Route
                    </p>
                  </th>
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Price
                    </p>
                  </th>
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Status
                    </p>
                  </th>
                  <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Created
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
                {bookings.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No bookings found for this {accountLabel}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProviderBookings;
