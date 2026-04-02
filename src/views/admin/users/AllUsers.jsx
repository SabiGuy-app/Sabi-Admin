import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import avatar  from "assets/img/avatars/avatar.png"
import { MdModeEditOutline, MdPeopleOutline } from "react-icons/md";
import { userAPI } from "services/api";


const AllUsers = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch all users once
        const data = await userAPI.getAllUsers(currentPage, itemsPerPage);
        const list = data?.data || data || [];

        // Map API response to our table format
        const mappedUsers = list.map((user, index) => ({
          id: user._id,
          name: user.fullName || "N/A",
          email: user.email,
          role: user.role === "buyer" ? "User" : "Provider",
          status: user.emailVerified ? "Active" : "Pending",
          dateJoined: new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          avatar:
            user.profilePicture || avatar
           ,
          phone: user.phoneNumber,
          city: user.city,
          rawRole: user.role, // Store raw role for filtering
        }));

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

        setAllUsers(mappedUsers);
        setTotalPages(computedTotalPages);
        setHasNext(
          computedTotalPages > 0
            ? currentPage < computedTotalPages
            : list.length === itemsPerPage
        );
        setError(null);
      } catch (err) {
        setError(err.message);
        setAllUsers([]);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const displayData = useMemo(() => {
    if (activeTab === "services") {
      return allUsers.filter((user) => user.rawRole === "buyer");
    }
    if (activeTab === "providers") {
      return allUsers.filter((user) => user.rawRole === "provider");
    }
    return allUsers; // "all" tab
  }, [allUsers, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Provider":
        return "bg-brand-100 text-brand-700";
      case "User":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {user.role}
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
          <MdPeopleOutline className="h-6 w-6 text-white" />
        </div>
      </h3>
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading users...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              Error loading users: {error}
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
                All Users
              </button>
              <button
                onClick={() => handleTabChange("services")}
                className={`px-4 pb-3 font-medium transition-all ${
                  activeTab === "services"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Service Users
              </button>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30">
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
                        Role
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
                  {displayData.length > 0 ? (
                    displayData.map((user) => (
                      <TableRow key={user.id} user={user} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No users found
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

export default AllUsers;
