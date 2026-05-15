import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdCheckCircle,
  MdEmail,
  MdInfo,
  MdLocalShipping,
  MdLocationOn,
  MdPayments,
  MdPerson,
  MdPeople,
  MdPhone,
  MdSchedule,
} from "react-icons/md";
import Card from "components/card";
import { bookingsAPI } from "services/api";

const BookingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (location.state?.booking) {
        return;
      }

      try {
        setLoading(true);
        const data = await bookingsAPI.getBookingById(id);
        setBooking(data?.data || data || null);
        setError(null);
      } catch (err) {
        setError(err.message);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, location.state]);

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
    return `₦${value.toLocaleString("en-NG")}`;
  };

  const formatNumber = (value, unit = "") => {
    if (typeof value !== "number") return "N/A";
    return `${value}${unit ? ` ${unit}` : ""}`;
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

  const customer = booking?.userId || {};
  const provider = booking?.providerId || {};
  const pickup = booking?.pickupLocation || {};
  const dropoff = booking?.dropoffLocation || {};
  const pricingBreakdown = booking?.pricingBreakdown || booking?.pricing?.breakdown || {};
  const breakdown = booking?.pricing?.breakdown || booking?.pricingBreakdown || {};
  const meta = booking?.pricing?.meta || booking?.pricingMeta || {};
  const payment = booking?.payment || {};
  const providerDistances = Array.isArray(booking?.providerDistances)
    ? booking.providerDistances
    : [];
  const providerPricingOptions = Array.isArray(booking?.providerPricingOptions)
    ? booking.providerPricingOptions
    : [];
  const notifiedProviders = Array.isArray(booking?.notifiedProviders)
    ? booking.notifiedProviders
    : [];
  const suggestedProviders = Array.isArray(booking?.suggestedProviders)
    ? booking.suggestedProviders
    : [];
  const attachments = Array.isArray(booking?.attachments) ? booking.attachments : [];

  const mapLinkFromCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
    const [lng, lat] = coordinates;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const pickupMapLink = mapLinkFromCoordinates(
    pickup?.coordinates?.coordinates
  );
  const dropoffMapLink = mapLinkFromCoordinates(
    dropoff?.coordinates?.coordinates
  );

  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="break-words text-sm font-semibold text-navy-700 dark:text-white sm:max-w-[65%] sm:text-right">
        {value}
      </span>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-navy-700 dark:text-white">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading booking details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Card extra="w-full p-6">
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            Booking details not available
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {error || `We could not load booking ID ${id}.`}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
          >
            <MdArrowBack className="h-4 w-4" />
            Back to Bookings
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
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <MdLocalShipping className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {toTitleCase(booking?.serviceType)} Booking
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Booking ID: {booking?._id}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    booking?.status
                  )}`}
                >
                  {toTitleCase(booking?.status)}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {toTitleCase(booking?.modeOfDelivery)}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {toTitleCase(booking?.scheduleType)}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-3 text-sm font-medium">
            <div className="mb-1 text-xs opacity-80">Created</div>
            {formatDateTime(booking?.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card extra="w-full p-6">
          <SectionTitle
            icon={MdPerson}
            title="Customer"
            subtitle="Rider and contact details"
          />
          <div className="space-y-3 text-sm">
            <DetailRow label="Name" value={customer?.fullName || "Not available"} />
            <DetailRow label="Email" value={customer?.email || "Not available"} />
            <DetailRow
              label="Phone"
              value={customer?.phoneNumber || "Not available"}
            />
            <DetailRow label="User ID" value={customer?._id || "Not available"} />
          </div>
        </Card>

        <Card extra="w-full p-6">
          <SectionTitle
            icon={MdLocationOn}
            title="Route"
            subtitle="Pickup and dropoff locations"
          />
          <div className="space-y-3 text-sm">
            <DetailRow label="Pickup" value={pickup?.address || "Not available"} />
            <DetailRow
              label="Dropoff"
              value={dropoff?.address || "Not available"}
            />
            <DetailRow
              label="Distance"
              value={formatNumber(booking?.distance?.value, booking?.distance?.unit)}
            />
            <DetailRow
              label="Estimated Duration"
              value={formatNumber(
                booking?.estimatedDuration?.value,
                booking?.estimatedDuration?.unit
              )}
            />
            <DetailRow
              label="Map Links"
              value={
                <span className="flex flex-wrap gap-2">
                  {pickupMapLink ? (
                    <a
                      href={pickupMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-500 hover:text-brand-600"
                    >
                      Pickup
                    </a>
                  ) : (
                    "Pickup unavailable"
                  )}
                  {dropoffMapLink ? (
                    <a
                      href={dropoffMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-500 hover:text-brand-600"
                    >
                      Dropoff
                    </a>
                  ) : null}
                </span>
              }
            />
          </div>
        </Card>

        <Card extra="w-full p-6">
          <SectionTitle
            icon={MdSchedule}
            title="Timing"
            subtitle="ETA and completion estimates"
          />
          <div className="space-y-3 text-sm">
            <DetailRow
              label="Provider ETA"
              value={formatNumber(
                booking?.providerETA?.value,
                booking?.providerETA?.unit
              )}
            />
            <DetailRow
              label="Estimated Arrival"
              value={formatDateTime(booking?.estimatedArrivalAt)}
            />
            <DetailRow
              label="Accepted At"
              value={formatDateTime(booking?.acceptedAt)}
            />
            <DetailRow
              label="Estimated Completion"
              value={formatDateTime(booking?.estimatedCompletionAt)}
            />
            <DetailRow
              label="Booking Duration"
              value={formatNumber(
                booking?.bookingDuration?.value,
                booking?.bookingDuration?.unit
              )}
            />
          </div>
        </Card>

        <Card extra="w-full p-6 md:col-span-2 xl:col-span-3">
          <SectionTitle
            icon={MdPayments}
            title="Pricing"
            subtitle="Final rider and driver amounts"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailRow
              label="Base Fare"
              value={formatCurrency(pricingBreakdown?.baseFare)}
            />
            <DetailRow
              label="Distance Cost"
              value={formatCurrency(pricingBreakdown?.distanceCost)}
            />
            <DetailRow
              label="Time Cost"
              value={formatCurrency(pricingBreakdown?.timeCost)}
            />
            <DetailRow
              label="Market Adjustment"
              value={formatCurrency(pricingBreakdown?.marketAdjustment)}
            />
            <DetailRow
              label="Subtotal"
              value={formatCurrency(pricingBreakdown?.subtotal)}
            />
            <DetailRow
              label="Platform Fee"
              value={formatCurrency(pricingBreakdown?.platformFee)}
            />
            <DetailRow
              label="Surge Multiplier"
              value={formatNumber(pricingBreakdown?.surgeMultiplier)}
            />
            <DetailRow
              label="Pre-Surge Fare"
              value={formatCurrency(pricingBreakdown?.preSurgeFare)}
            />
            <DetailRow
              label="Rider Pays Before Tax"
              value={formatCurrency(pricingBreakdown?.riderPaysBeforeTax)}
            />
            <DetailRow
              label="Tax"
              value={formatCurrency(pricingBreakdown?.tax)}
            />
            <DetailRow
              label="Rider Pays Final"
              value={formatCurrency(pricingBreakdown?.riderPaysFinal)}
            />
            <DetailRow
              label="Driver Commission"
              value={formatCurrency(pricingBreakdown?.driverCommission)}
            />
            <DetailRow
              label="Driver Receives"
              value={formatCurrency(pricingBreakdown?.driverReceives)}
            />
            <DetailRow
              label="Platform Earns"
              value={formatCurrency(pricingBreakdown?.platformEarns)}
            />
          </div>
        </Card>

        <Card extra="w-full p-6">
          <SectionTitle
            icon={MdCheckCircle}
            title="Payment"
            subtitle="Escrow and payout state"
          />
          <div className="space-y-3 text-sm">
            <DetailRow
              label="Escrow Status"
              value={toTitleCase(payment?.escrowStatus)}
            />
            <DetailRow
              label="Escrow Amount"
              value={formatCurrency(payment?.escrowAmount)}
            />
            <DetailRow
              label="Provider Receives"
              value={formatCurrency(payment?.providerReceives)}
            />
            <DetailRow
              label="Paystack Ref"
              value={payment?.paystackRef || "Not available"}
            />
            <DetailRow label="Paid At" value={formatDateTime(payment?.paidAt)} />
          </div>
        </Card>

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-start gap-3">
            {provider?.profilePicture ? (
              <img
                src={provider.profilePicture}
                alt={provider?.fullName || "Provider"}
                className="h-10 w-10 rounded-xl border border-gray-200 object-cover dark:border-gray-700"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <MdLocalShipping className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Provider
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned driver information
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <DetailRow
              label="Name"
              value={provider?.fullName || "Not available"}
            />
            <DetailRow
              label="Email"
              value={provider?.email || "Not available"}
            />
            <DetailRow
              label="Provider ID"
              value={provider?._id || "Not available"}
            />
            <DetailRow
              label="Receives"
              value={formatCurrency(booking?.providerReceives)}
            />
            <DetailRow
              label="Contact Card"
              value={
                <span className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1">
                    <MdEmail className="h-4 w-4 text-brand-500" />
                    {provider?.email || "N/A"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MdPhone className="h-4 w-4 text-brand-500" />
                    {provider?.phoneNumber || "N/A"}
                  </span>
                </span>
              }
            />
          </div>
        </Card>

       

        <Card extra="w-full p-6 md:col-span-2 xl:col-span-3">
          <SectionTitle
            icon={MdInfo}
            title="Pricing Metadata"
            subtitle="Calculation inputs and rate settings"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailRow
              label="Vehicle Category"
              value={toTitleCase(meta?.vehicleCategory)}
            />
            <DetailRow
              label="Distance Km"
              value={formatNumber(meta?.distanceKm)}
            />
            <DetailRow
              label="Duration Minutes"
              value={formatNumber(meta?.durationMinutes)}
            />
            <DetailRow
              label="Surge Multiplier"
              value={formatNumber(meta?.ratesUsed?.surgeMultiplier)}
            />
            <DetailRow
              label="Per Km Rate"
              value={formatCurrency(meta?.ratesUsed?.perKmRate)}
            />
            <DetailRow
              label="Per Minute Rate"
              value={formatCurrency(meta?.ratesUsed?.perMinuteRate)}
            />
            <DetailRow
              label="Tax Rate"
              value={formatNumber(meta?.ratesUsed?.taxRate, "%")}
            />
            <DetailRow
              label="Fuel Price / Litre"
              value={formatCurrency(meta?.ratesUsed?.fuelPricePerLitre)}
            />
          </div>
        </Card>

        <Card extra="w-full p-6">
          <SectionTitle
            icon={MdPeople}
            title="Provider Matching"
            subtitle="Suggested and notified providers"
          />
          <div className="space-y-3 text-sm">
            <DetailRow
              label="Notified Providers"
              value={notifiedProviders.length}
            />
            <DetailRow
              label="Suggested Providers"
              value={suggestedProviders.length}
            />
            <DetailRow
              label="Provider Distances"
              value={providerDistances.length}
            />
            <DetailRow
              label="Pricing Options"
              value={providerPricingOptions.length}
            />
          </div>
        </Card>

        <Card extra="w-full p-6 md:col-span-2">
          <SectionTitle
            icon={MdInfo}
            title="Matching Details"
            subtitle="Closest provider and their calculated offer"
          />
          {providerDistances.length > 0 ? (
            <div className="space-y-3">
              {providerDistances.map((item) => (
                <div
                  key={item?._id || item?.providerId}
                  className="rounded-lg border border-gray-100 p-4 text-sm dark:border-gray-700"
                >
                  <p className="font-semibold text-navy-700 dark:text-white">
                    Provider: {item?.providerId || "Not available"}
                  </p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Distance from pickup: {formatNumber(item?.distanceFromPickup, "km")}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ETA: {formatNumber(item?.providerETAMinutes, "minutes")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No provider distance data available
            </p>
          )}
        </Card>

        <Card extra="w-full p-6 md:col-span-2">
          <SectionTitle
            icon={MdPayments}
            title="Provider Pricing Options"
            subtitle="Per-provider calculation results"
          />
          {providerPricingOptions.length > 0 ? (
            <div className="space-y-3">
              {providerPricingOptions.map((item) => (
                <div
                  key={item?._id || item?.providerId}
                  className="rounded-lg border border-gray-100 p-4 text-sm dark:border-gray-700"
                >
                  <p className="font-semibold text-navy-700 dark:text-white">
                    Provider: {item?.providerId || "Not available"}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailRow
                      label="Rider Pays"
                      value={formatCurrency(item?.riderPays)}
                    />
                    <DetailRow
                      label="Driver Receives"
                      value={formatCurrency(item?.driverReceives)}
                    />
                    <DetailRow
                      label="Platform Earns"
                      value={formatCurrency(item?.platformEarns)}
                    />
                    <DetailRow
                      label="Subtotal"
                      value={formatCurrency(item?.breakdown?.subtotal)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No provider pricing options available
            </p>
          )}
        </Card>

        <Card extra="w-full p-6 md:col-span-2 xl:col-span-3">
          <SectionTitle
            icon={MdInfo}
            title="Attachments and Audit"
            subtitle="Supporting files and timestamps"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailRow label="Attachments" value={attachments.length} />
            <DetailRow label="Selected At" value={formatDateTime(booking?.selectedAt)} />
            <DetailRow label="Updated At" value={formatDateTime(booking?.updatedAt)} />
            <DetailRow label="Accepted At" value={formatDateTime(booking?.acceptedAt)} />
            <DetailRow label="Completed At" value={formatDateTime(booking?.completedAt) || "Booking not completed"} />

          </div>
          {attachments.length > 0 ? (
            <div className="mt-4 space-y-3">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment}-${index}`}
                  className="rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-700"
                >
                  {typeof attachment === "string" ? attachment : JSON.stringify(attachment)}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              No attachments uploaded for this booking
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingDetails;
