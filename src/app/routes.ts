import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { PropertyDetails } from "./pages/PropertyDetails";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { OwnerRegister } from "./pages/OwnerRegister";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { AddProperty } from "./pages/AddProperty";
import { Profile } from "./pages/Profile";
import { AuthCallback } from "./pages/AuthCallback";
import { Reservation } from "./pages/Reservation";
import { Payment } from "./pages/Payment";
import { Layout } from "./Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "search",
        Component: Search,
      },
      {
        path: "property/:slug",
        Component: PropertyDetails,
      },
      {
        path: "signup",
        Component: SignUp,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "auth/callback",
        Component: AuthCallback,
      },
      {
        path: "owner/register",
        Component: OwnerRegister,
      },
      {
        path: "owner/dashboard",
        Component: OwnerDashboard,
      },
      {
        path: "owner/add-property",
        Component: AddProperty,
      },
      {
        path: "reservation",
        Component: Reservation,
      },
      {
        path: "payment",
        Component: Payment,
      },
    ],
  },
]);