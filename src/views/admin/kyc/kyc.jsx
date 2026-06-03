import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  MdArrowBack,
  MdVerified,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdFileDownload,
  MdBadge,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdDirectionsCar,
} from "react-icons/md";
import Card from "components/card";
import { kycAPI, userAPI } from "services/api";

const KYCPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryEntityType = new URLSearchParams(location.search).get("type");
  const [provider, setProvider] = useState(null);
  const [entityType, setEntityType] = useState(
    location.state?.entityType || queryEntityType || "providers"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = React.useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  useEffect(() => {
    const fetchKYCSubject = async () => {
      try {
        setLoading(true);
        // Try to get from location state first
        if (location.state?.provider) {
          setProvider(location.state.provider);
          setEntityType(
            location.state?.entityType || queryEntityType || "providers"
          );
          return;
        }

        // Otherwise fetch from API
        const data =
          entityType === "users"
            ? await userAPI.getUserById(id)
            : await kycAPI.getProviderById(id);
        setProvider(data.data || data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProvider(null);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCSubject();
  }, [entityType, id, location.state, queryEntityType]);

  const isServiceUser = entityType === "users" || provider?.role === "buyer";

  const handleApproveKYC = async () => {
    try {
      setApproving(true);
      if (isServiceUser) {
        await kycAPI.verifyBuyerKYC(provider._id);
      } else {
        await kycAPI.verifyProviderKYC(provider._id);
      }

      setProvider({
        ...provider,
        kycVerified: true,
        kycCompleted: true,
        kycVerifiedAt: new Date().toISOString(),
      });

      showToast(`${isServiceUser ? "User NIN" : "KYC"} approved successfully!`);
    } catch (err) {
      showToast(`Error approving KYC: ${err.message}`, "error");
    } finally {
      setApproving(false);
    }
  };

  const handleRejectKYC = async () => {
    try {
      setRejecting(true);
      await kycAPI.rejectProviderKYC(provider._id, rejectReason);

      setProvider({
        ...provider,
        kycVerified: false,
        kycCompleted: false,
      });

      setShowRejectModal(false);
      setRejectReason("");
      showToast("KYC rejected successfully!");
    } catch (err) {
      showToast(`Error rejecting KYC: ${err.message}`, "error");
    } finally {
      setRejecting(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Not verified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not verified";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getKYCStatusColor = () => {
    if (provider?.kycVerified) {
      return "from-green-500 via-emerald-500 to-success-800";
    }
    if (provider?.kycCompleted) {
      return "from-yellow-500 via-amber-500 to-orange-700";
    }
    return "from-red-500 via-rose-500 to-red-700";
  };

  const getKYCStatusText = () => {
    if (provider?.kycVerified) {
      return "KYC Verified";
    }
    if (provider?.kycCompleted) {
      return "KYC Pending Review";
    }
    return "KYC Incomplete";
  };
  const jobList = Array.isArray(provider?.job) ? provider.job : [];

  const allWorkPictures = (provider?.workVisuals || []).flatMap((item) =>
    Array.isArray(item?.pictures) ? item.pictures : []
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading KYC details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Card extra="w-full p-6">
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            Error loading KYC details
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {error || "Provider not found"}
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
    <div className="mx-auto w-full max-w-6xl p-2">
      {toast && (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <MdArrowBack className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          KYC Verification
        </h1>
      </div>

      {/* Header Card with Status */}
      <div
        className={`mb-6 rounded-2xl bg-gradient-to-r ${getKYCStatusColor()} p-6 text-white shadow-xl`}
      >
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          {provider.profilePicture ? (
            <img
              src={provider.profilePicture}
              alt={provider.fullName}
              className="h-20 w-20 rounded-2xl border-2 border-white/60 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/20 text-2xl font-bold">
              {provider.fullName?.[0] || "P"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{provider.fullName}</h2>
            <p className="mt-1 text-sm text-white/80">{provider.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {provider.kycVerified ? (
                  <>
                    <MdCheckCircle className="h-3 w-3" />
                    Verified
                  </>
                ) : provider.kycCompleted ? (
                  <>
                    <MdPending className="h-3 w-3" />
                    Pending
                  </>
                ) : (
                  <>
                    <MdCancel className="h-3 w-3" />
                    Incomplete
                  </>
                )}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                KYC Level {provider.kycLevel || 0}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {provider.role}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-3 text-center text-sm font-medium">
            <div className="mb-1 text-xs opacity-80">Joined</div>
            {new Date(provider.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!provider.kycVerified && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleApproveKYC}
            disabled={approving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 disabled:opacity-50"
          >
            {approving ? (
              <>
                <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white"></div>
                Approving...
              </>
            ) : (
              <>
                <MdCheckCircle className="h-4 w-4" />
                Approve {isServiceUser ? "NIN" : "KYC"}
              </>
            )}
          </button>
          {!isServiceUser && (
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejecting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
            >
              <MdCancel className="h-4 w-4" />
              Reject KYC
            </button>
          )}
        </div>
      )}

      {/* KYC Status Section */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
              <MdVerified className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              KYC Status
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-navy-700 dark:text-white">
                {getKYCStatusText()}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                KYC Level
              </p>
              <p className="text-lg font-bold text-navy-700 dark:text-white">
                {provider.kycLevel || 0}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified At
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatDateTime(provider.kycVerifiedAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <MdEmail className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Contact Information
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <MdEmail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {provider.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <MdPhone className="text-emerald-500 h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {provider.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {!isServiceUser && (
          <Card extra="w-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 flex h-10 w-10 items-center justify-center rounded-xl">
                <MdBadge className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Job Details
              </h3>
            </div>
            {jobList.length > 0 ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {jobList.map((job, index) => (
                  <div
                    key={job?._id || index}
                    className="rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                  >
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      {job?.service || "Not available"}
                    </p>
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {job?.title || "Not available"}
                    </p>
                    <p>
                      <span className="font-medium">Job ID:</span>{" "}
                      {job?._id || "Not available"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No jobs available
              </p>
            )}
          </Card>
        )}

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              <MdLocationOn className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Location & Account
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Address:</span>{" "}
              {provider.address || "Not provided"}
            </p>
            <p>
              <span className="font-medium">City:</span>{" "}
              {provider.city || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Account Type:</span>{" "}
              {provider.accountType || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Gender:</span>{" "}
              {provider.gender || "Not provided"}
            </p>
          </div>
        </Card>

        {!isServiceUser && (
          <Card extra="w-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                <MdBadge className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Banking Information
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Bank Name:</span>{" "}
                {provider.bankName || "Not provided"}
              </p>
              <p>
                <span className="font-medium">Account Name:</span>{" "}
                {provider.accountName || "Not provided"}
              </p>
              <p>
                <span className="font-medium">Account Number:</span>{" "}
                {provider.accountNumber || "Not provided"}
              </p>
              <p>
                <span className="font-medium">Bank Code:</span>{" "}
                {provider.bankCode || "Not provided"}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Documents Section */}
      <div className="mb-6 grid gap-6">
        {/* NIN Slip */}
        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              <MdFileDownload className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              NIN/Identity Document
            </h3>
          </div>
          {provider.ninSlip ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={provider.ninSlip}
                target="_blank"
                rel="noreferrer"
                className="group block flex-1 overflow-hidden rounded-xl border-2 border-purple-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-purple-800 dark:bg-navy-800"
              >
                <img
                  src={provider.ninSlip}
                  alt="NIN Slip"
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MdFileDownload className="mb-1 inline h-4 w-4" />
                  View Document
                </div>
              </a>
              <div className="flex flex-1 flex-col justify-start gap-2 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  Document Status: Provided
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Click the image to view the full document
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                NIN document not uploaded
              </p>
            </div>
          )}
        </Card>

        {!isServiceUser && (
          <>
        {/* Work Visuals */}
        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-300">
              <MdDirectionsCar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Work Visuals
              <span className="ml-2 inline-block text-sm font-normal text-gray-600 dark:text-gray-400">
                ({allWorkPictures.length} images)
              </span>
            </h3>
          </div>
          {allWorkPictures.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {allWorkPictures.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-xl border-2 border-lime-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-lime-800 dark:bg-navy-800"
                >
                  <img
                    src={url}
                    alt={`Work visual ${index + 1}`}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                    Image {index + 1}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                No work visuals uploaded
              </p>
            </div>
          )}
        </Card>

        {/* Vehicle & License Information */}
        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
              <MdDirectionsCar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Vehicle & License Information
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vehicle Name
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                {provider.vehicleName || "Not provided"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vehicle Color
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                {provider.vehicleColor || "Not provided"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registration Number
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                {provider.vehicleRegNo || "Not provided"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Driver License Number
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                {provider.driverLicenseNumber || "Not provided"}
              </p>
            </div>
          </div>
        </Card>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center">
          <Card extra="w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowRejectModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Reject KYC Application
            </h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this KYC application..."
                className="h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKYC}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KYCPage;
