import React, { useMemo, useState } from "react";
import Card from "components/card";
import { MdModeEditOutline } from "react-icons/md";

const Users = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sample user data
  const allUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Service Provider",
      status: "Active",
      dateJoined: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Service User",
      status: "Active",
      dateJoined: "2024-02-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Service Provider",
      status: "Active",
      dateJoined: "2024-01-10",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "Service User",
      status: "Inactive",
      dateJoined: "2024-03-05",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      role: "Service Provider",
      status: "Pending",
      dateJoined: "2024-03-10",
    },
  ];

  const serviceUsers = allUsers.filter((user) => user.role === "Service User");
  const serviceProviders = allUsers.filter(
    (user) => user.role === "Service Provider"
  );

  const getDisplayData = () => {
    switch (activeTab) {
      case "services":
        return serviceUsers;
      case "providers":
        return serviceProviders;
      default:
        return allUsers;
    }
  };

  const displayData = useMemo(() => getDisplayData(), [activeTab]);
  const totalPages = Math.max(
    1,
    Math.ceil(displayData.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return displayData.slice(start, start + itemsPerPage);
  }, [displayData, safePage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-500";
      case "Inactive":
        return "text-red-500";
      case "Pending":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const handleViewDetails = (user) => {
    alert(`View details for: ${user.name}\nEmail: ${user.email}`);
    // In a real app, this would navigate to a detail page
  };

  const TableRow = ({ user }) => (
    <tr>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {user.name}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
      </td>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {user.role}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
      </td>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.dateJoined}
        </p>
      </td>
      <td className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <button
          onClick={() => handleViewDetails(user)}
          className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          <MdModeEditOutline className="h-4 w-4" />
          View Details
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <Card extra="w-full h-full sm:overflow-auto px-2 py-4">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Name
                  </p>
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Email
                  </p>
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Role
                  </p>
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Status
                  </p>
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Date Joined
                  </p>
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Action
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((user) => (
                <TableRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {displayData.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No users found</p>
          </div>
        )}

        {/* Pagination */}
        {displayData.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {(safePage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {Math.min(safePage * itemsPerPage, displayData.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {displayData.length}
              </span>{" "}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {safePage} of {totalPages}
              </span>
              <button
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Users;
