import SignIn from "../pages/AuthPages/SignIn";
import NotFound from "../pages/OtherPage/NotFound";
import Home from "../pages/Dashboard/Home.tsx";
import UserProfiles from "../pages/UserProfiles.tsx";
import Roles from "../pages/Roles/Roles.tsx";
import AddRole from "../pages/Roles/AddRole.tsx";
import Logout from "../pages/AuthPages/Logout.tsx";
import BusinessDomainsPage from "../pages/BusinessDomains/BusinessDomains.tsx";
import AddBusinessDomain from "../pages/BusinessDomains/AddBusinessDomain.tsx";
import BusinessesPage from "../pages/Businesses/Businesses.tsx";
import PlatformPaymentSettingsPage from "../pages/PlatformPaymentSettings/PlatformPaymentSettings.tsx";


export const authProtectedRoutes = [
    {index: true, element: <Home/>, path: '/'}, // index route
    {path: "/roles/update/:id", element: <AddRole/>}, // oddiy route
    {path: "/roles/add", element: <AddRole/>}, // oddiy route
    {path: "/roles", element: <Roles/>}, // oddiy route
    {path: "/businesses", element: <BusinessesPage/>},
    {path: "/platform-payment-settings", element: <PlatformPaymentSettingsPage/>},
    {path: "/business-domains/update/:id", element: <AddBusinessDomain/>},
    {path: "/business-domains/add", element: <AddBusinessDomain/>},
    {path: "/business-domains", element: <BusinessDomainsPage/>},

    // Others Page
    {path: "/profile", element: <UserProfiles/>},
    // {path: "/calendar", element: <Calendar/>},
    // {path: "/blank", element: <Blank/>},
    //
    // // Forms
    // {path: "/form-elements", element: <FormElements/>},
    //
    // // Tables
    // {path: "/basic-tables", element: <BasicTables/>},
    //
    // // UI Elements
    // {path: "/alerts", element: <Alerts/>},
    // {path: "/avatars", element: <Avatars/>},
    // {path: "/badge", element: <Badges/>},
    // {path: "/buttons", element: <Buttons/>},
    // {path: "/images", element: <Images/>},
    // {path: "/videos", element: <Videos/>},
    //
    // // Charts
    // {path: "/line-chart", element: <LineChart/>},
    // {path: "/bar-chart", element: <BarChart/>},
    // Fallback
    {path: "*", element: <NotFound/>},
];
export const publicRoutes = [
    {path: "/login", element: <SignIn/>},
    {path: "/logout", element: <Logout/>},
    {path: "*", element: <NotFound/>}
]
