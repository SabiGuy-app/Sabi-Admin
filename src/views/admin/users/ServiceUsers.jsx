import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import avatar  from "assets/img/avatars/avatar.png"
import { MdModeEditOutline, MdAccountCircle } from "react-icons/md";
import { userAPI } from "services/api";

const ServiceUsers = () => {
  const navigate = useNavigate();
  const [serviceUsers, setServiceUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getServiceUsers(currentPage, itemsPerPage);

        // Filter only service users (role === "buyer")
        const list = data?.data || data || [];
        const filteredUsers = list
          .filter((user) => user.role === "buyer")
          .map((user, index) => ({
            id: user._id,
            name: user.fullName || "N/A",
            email: user.email,
            role: "Service User",
            status: user.emailVerified ? "Active" : "Pending",
            dateJoined: new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            avatar:
              user.profilePicture || avatar,
            phone: user.phoneNumber,
            city: user.city,
            totalBookings: user.bookingsCount || 0,
          }));

        setServiceUsers(filteredUsers);
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
        setServiceUsers([]);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // const getRoleBadgeColor = (role) => {
  //   switch (role) {
  //     case "Service Provider":
  //       return "bg-brand-100 text-brand-700";
  //     case "Service User":
  //       return "bg-blue-100 text-blue-700";
  //     default:
  //       return "bg-gray-100 text-gray-700";
  //   }
  // };

  const handleViewDetails = (user) => {
    navigate(`/admin/user-details/${user.id}`, { state: { user } });
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.totalBookings}
        </p>
      </td>
      {/* <td className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {user.role}
        </span>
      </td> */}
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
      </h3>
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading service users...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading service users: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
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
                        Bookings
                      </p>
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-left dark:border-gray-700">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Status
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
                  {serviceUsers.length > 0 ? (
                    serviceUsers.map((user) => (
                      <TableRow key={user.id} user={user} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No service users found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {serviceUsers.length > 0 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + serviceUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-navy-700 dark:text-white">
                    {totalPages > 0 ? totalPages * itemsPerPage : "many"}
                  </span>{" "}
                  users
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

export default ServiceUsers;
