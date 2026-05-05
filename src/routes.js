import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
// import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";
import AllUsers from "views/admin/users/AllUsers";
import ServiceUsers from "views/admin/users/ServiceUsers";
import ServiceProviders from "views/admin/users/ServiceProviders";
import AllBookings from "views/admin/bookings/AllBookings";
import BookingDetails from "views/admin/bookings/BookingDetails";
import ProviderBookings from "views/admin/bookings/ProviderBookings";
import PlatformFeePage from "views/admin/platform-fee";
import KYCList from "views/admin/kyc/KYCList";
import KYCPage from "views/admin/kyc/kyc";

// Auth Imports
import SignIn from "views/auth/SignIn";
import Logout from "views/auth/Logout";

// Icon Imports
import {
  MdHome,
  MdPerson,
  MdLock,
  MdBusiness,
  MdAccountBalanceWallet,
  MdPayments,
  MdRateReview,
  MdPeopleOutline,
  MdLogout,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "All Users",
    layout: "/admin",
    path: "all-users",
    icon: <MdPeopleOutline className="h-6 w-6" />,
    component: <AllUsers />,
  },
  {
    name: "Service Users",
    layout: "/admin",
    path: "service-users",
    icon: <MdPerson className="h-6 w-6" />,
    component: <ServiceUsers />,
  },
  {
    name: "Service Providers",
    layout: "/admin",
    path: "service-providers",
    icon: <MdBusiness className="h-6 w-6" />,
    component: <ServiceProviders />,
  },

  {
    name: "Transactions",
    layout: "/admin",
    path: "transactions",
    icon: <MdPayments className="h-6 w-6" />,
    component: <DataTables />,
  },
  {
    name: "Bookings",
    layout: "/admin",
    path: "bookings",
    icon: <MdPayments className="h-6 w-6" />,
    component: <AllBookings />,
  },
  {
    name: "Platform Fee",
    layout: "/admin",
    path: "platform-fee",
    icon: <MdAccountBalanceWallet className="h-6 w-6" />,
    component: <PlatformFeePage />,
  },
  {
    name: "Booking Details",
    layout: "/admin",
    path: "booking-details/:id",
    icon: <MdPayments className="h-6 w-6" />,
    component: <BookingDetails />,
    invisible: true,
  },
  {
    name: "Provider Bookings",
    layout: "/admin",
    path: "provider-bookings/:id",
    icon: <MdPayments className="h-6 w-6" />,
    component: <ProviderBookings />,
    invisible: true,
  },
  {
    name: "User Bookings",
    layout: "/admin",
    path: "user-bookings/:id",
    icon: <MdPayments className="h-6 w-6" />,
    component: <ProviderBookings />,
    invisible: true,
  },
  // {
  //   name: "Disputes & Support",
  //   layout: "/admin",
  //   path: "disputes",
  //   icon: <MdReportProblem className="h-6 w-6" />,
  //   component: <DataTables />,
  // },
  // {
  //   name: "Reviews & Ratings",
  //   layout: "/admin",
  //   path: "reviews",
  //   icon: <MdRateReview className="h-6 w-6" />,
  //   component: <DataTables />,
  // },

  {
    name: "KYC & Verification",
    layout: "/admin",
    path: "kyc",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <KYCList />,
  },

  // {
  //   name: "Analytics",
  //   layout: "/admin",
  //   path: "analytics",
  //   icon: <MdAnalytics className="h-6 w-6" />,
  //   component: <DataTables />,
  // },
  // {
  //   name: "Settings",
  //   layout: "/admin",
  //   path: "settings",
  //   icon: <MdSettings className="h-6 w-6" />,
  //   component: <Profile />,
  // },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    invisible: true,
  },
  {
    name: "Logout",
    layout: "/auth",
    path: "logout",
    icon: <MdLogout className="h-6 w-6" />,
    component: <Logout />,
  },
  {
    name: "KYC Details",
    layout: "/admin",
    path: "kyc-details/:id",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <KYCPage />,
    invisible: true,
  },
];
export default routes;
