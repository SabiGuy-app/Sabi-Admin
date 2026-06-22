import React, {useState} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdBadge,
  MdCalendarToday,
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdVerified,
  MdAssignment,
  MdCheckCircle,
} from "react-icons/md";
import Card from "components/card";
import {userAPI} from "services/api";

const UserDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(!location.state?.user);
 
  const [toast, setToast] = useState(null);
  const toastTimerRef = React.useRef(null);
  

  const user = location.state?.user || null;
  const isProvider =
    user?.role === "Service Provider" || user?.role === "provider";

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

  const formatBool = (value) => (value ? "Yes" : "No");
  const countOrZero = (value) => (Array.isArray(value) ? value.length : 0);

  const ratingValue = (() => {
    if (typeof user?.rating === "number") return user.rating.toFixed(1);
    if (typeof user?.rating?.average === "number")
      return user.rating.average.toFixed(1);
    if (typeof user?.rating?.value === "number")
      return user.rating.value.toFixed(1);
    return "Not available";
  })();

  const jobList = Array.isArray(user?.job) ? user.job : [];
  const workVisualsList = Array.isArray(user?.workVisuals)
    ? user.workVisuals
    : [];
  const allWorkPictures = workVisualsList.flatMap((item) =>
    Array.isArray(item?.pictures) ? item.pictures : []
  );
  const locationCoords = Array.isArray(user?.currentLocation?.coordinates)
    ? user.currentLocation.coordinates
    : null;
  const locationLat = locationCoords?.[1];
  const locationLng = locationCoords?.[0];
  const locationLabel =
    typeof locationLat === "number" && typeof locationLng === "number"
      ? `${locationLat.toFixed(5)}, ${locationLng.toFixed(5)}`
      : "Not available";

      const showToast = (message, type = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  };
const userType = isProvider ? "provider" : "buyer";


  const handleDeactivateUser = async () => {
    if (!window.confirm("Are you sure you want to deactivate this user? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      await userAPI.deactivateUser(id, userType);
      showToast("User deactivated successfully.");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      showToast(`Failed to deactivate user: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Card extra="w-full p-6">
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            User details not available
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            We could not load details for user ID {id}. Please return to the
            list and try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
          >
            <MdArrowBack className="h-4 w-4" />
            Back to Users
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
      {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading details...
              </p>
            </div>
          </div>
        )}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <MdArrowBack className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-r from-brand-500 via-green-500 to-green-800 p-6 text-white shadow-xl">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 rounded-2xl border-2 border-white/60 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/20 text-2xl font-bold">
              {user.name?.[0] || "U"}
            </div>
          )}
                       
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="mt-1 text-sm text-white/80">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {user.role}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {user.status}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                ID: {user.id}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-3 text-sm font-medium">
            Member since {user.dateJoined || "Not available"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <MdEmail className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Contact Info
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <MdEmail className="h-4 w-4 text-blue-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdPhone className="h-4 w-4 text-blue-500" />
              <span>{user.phone || "No phone provided"}</span>
            </div>
          </div>
          
        </Card>

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <MdVerified className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Account Info
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <MdBadge className="h-4 w-4 text-emerald-500" />
              <span>{user.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdVerified className="h-4 w-4 text-emerald-500" />
              <span>Status: {user.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCalendarToday className="h-4 w-4 text-emerald-500" />
              <span>Joined: {user.dateJoined || "Not available"}</span>
            </div>
          </div>
          <div className ="mb-4 mt-6 flex items-center gap-3 md:mb-0">
                        <button
                          onClick={handleDeactivateUser}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
                        >
                          <MdCheckCircle className="h-4 w-4" />
                          Deactivate User
                        </button>
                        </div>
        </Card>

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              <MdLocationOn className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Location
            </h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {user.address
              ? `${user.address}${user.city ? ", " : ""}${user.city || ""}`
              : user.city || "No location provided"}
          </p>
        </Card>

        <Card extra="w-full p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              <MdBadge className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Profile Snapshot
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>User ID: {user.id}</p>
            <p>Email verification: {user.status}</p>
            <p>Role tag: {user.role}</p>
          </div>
        </Card>

        {isProvider && (
          <>
            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <MdVerified className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Verification & KYC
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Email verified: {formatBool(user.emailVerified)}</p>
                <p>KYC completed: {formatBool(user.kycCompleted)}</p>
                <p>KYC verified: {formatBool(user.kycVerified)}</p>
                <p>KYC level: {user.kycLevel ?? "Not available"}</p>
                <p>Account type: {user.accountType || "Not available"}</p>
              </div>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                  <MdBadge className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Banking Details
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Bank name: {user.bankName || "Not available"}</p>
                <p>Account name: {user.accountName || "Not available"}</p>
                <p>Account number: {user.accountNumber || "Not available"}</p>
                <p>Bank code: {user.bankCode || "Not available"}</p>
              </div>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <MdAssignment className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Bookings
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                View all bookings assigned to this provider.
              </p>
              <button
                onClick={() =>
                  navigate(`/admin/provider-bookings/${user.id}`, {
                    state: { provider: user },
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                <MdAssignment className="h-4 w-4" />
                View Bookings
              </button>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
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

            <Card extra="w-full p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-300">
                  <MdBadge className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Work Visuals
                </h3>
              </div>
              {allWorkPictures.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {allWorkPictures.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-navy-800"
                    >
                      <img
                        src={url}
                        alt={`Work visual ${index + 1}`}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                        View image {index + 1}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No work visuals uploaded
                </p>
              )}
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                  <MdBadge className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Vehicle & License
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Vehicle name: {user.vehicleName || "Not available"}</p>
                <p>Vehicle color: {user.vehicleColor || "Not available"}</p>
                <p>Reg number: {user.vehicleRegNo || "Not available"}</p>
                <p>
                  Driver license: {user.driverLicenseNumber || "Not available"}
                </p>
              </div>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <MdCalendarToday className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Work & Activity
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Completed jobs: {user.completedJobs ?? 0}</p>
                <p>Rating: {ratingValue}</p>
                <p>Jobs posted: {countOrZero(user.job)}</p>
                <p>Services: {countOrZero(user.service)}</p>
                <p>Work visuals: {countOrZero(user.workVisuals)}</p>
              </div>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                  <MdLocationOn className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Location & Availability
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Allow anywhere: {formatBool(user.allowAnywhere)}</p>
                <p>
                  Current location: {locationLabel}
                </p>
                {typeof locationLat === "number" &&
                  typeof locationLng === "number" && (
                    <a
                      href={`https://www.google.com/maps?q=${locationLat},${locationLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      Open in Maps
                    </a>
                  )}
                <p>
                  Availability:{" "}
                  {user.availability ? "Available" : "Not available"}
                </p>
              </div>
            </Card>

            <Card extra="w-full p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <MdBadge className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                  Documents & Files
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>NIN slip: {user.ninSlip ? "Provided" : "Not available"}</p>
                <p>Files uploaded: {countOrZero(user.files)}</p>
                <p>Google user: {formatBool(user.isGoogleUser)}</p>
                <p>Google ID: {user.googleId || "Not available"}</p>
                <p>Updated at: {formatDateTime(user.updatedAt)}</p>
                <p>Refresh token expires: {formatDateTime(user.refreshTokenExpiresAt)}</p>
              </div>
            </Card>
          </>
        )}

        {!isProvider && (
          <Card extra="w-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                <MdAssignment className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Bookings
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              View all bookings created by this user.
            </p>
            <button
              onClick={() =>
                navigate(`/admin/user-bookings/${user.id}`, {
                  state: { user },
                })
              }
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
            >
              <MdAssignment className="h-4 w-4" />
              View Bookings
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
