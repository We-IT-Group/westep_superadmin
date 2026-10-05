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
import BusinessPaymentSettingsPage from "../pages/PlatformPaymentSettings/BusinessPaymentSettingsPage.tsx";
import TopUpPaymentSettingsPage from "../pages/PlatformPaymentSettings/TopUpPaymentSettingsPage.tsx";
import CourseModerationPage from "../pages/CourseModeration/CourseModeration.tsx";
import InterestQuizQuestionsPage from "../pages/InterestQuiz/InterestQuizQuestions.tsx";
import StudentProfessionsReviewPage from "../pages/StudentProfessions/StudentProfessionsReview.tsx";
import RoadmapTemplatesPage from "../pages/RoadmapTemplates/RoadmapTemplates.tsx";
import GiftsPage from "../pages/Gifts/GiftsPage.tsx";
import GiftOrdersPage from "../pages/Gifts/GiftOrdersPage.tsx";
import CoinSettingsPage from "../pages/Gifts/CoinSettingsPage.tsx";
import HabitsPage from "../pages/Habits/HabitsPage.tsx";
import TaxonomyPage from "../pages/Taxonomy/TaxonomyPage.tsx";
import SubscriptionPlansPage from "../pages/SubscriptionPlans/SubscriptionPlans.tsx";
import AddSubscriptionPlan from "../pages/SubscriptionPlans/AddSubscriptionPlan.tsx";
import AppTranslationsPage from "../pages/AppTranslations/AppTranslationsPage.tsx";
import AdminNotificationsPage from "../pages/AdminNotifications/AdminNotificationsPage.tsx";
import PlanPage from "../pages/Growth/PlanPage.tsx";
import MetricsPage from "../pages/Growth/MetricsPage.tsx";
import MarketingPage from "../pages/Growth/MarketingPage.tsx";
import SchoolsPage from "../pages/Growth/SchoolsPage.tsx";


export const authProtectedRoutes = [
    {index: true, element: <Home/>, path: '/'}, // index route
    {path: "/roles/update/:id", element: <AddRole/>}, // oddiy route
    {path: "/roles/add", element: <AddRole/>}, // oddiy route
    {path: "/roles", element: <Roles/>}, // oddiy route
    {path: "/businesses", element: <BusinessesPage/>},
    {path: "/platform-payment-settings", element: <PlatformPaymentSettingsPage/>},
    {path: "/platform-payment-settings/top-up", element: <TopUpPaymentSettingsPage/>},
    {path: "/platform-payment-settings/:businessId", element: <BusinessPaymentSettingsPage/>},
    {path: "/subscription-plans/update/:id", element: <AddSubscriptionPlan/>},
    {path: "/subscription-plans/add", element: <AddSubscriptionPlan/>},
    {path: "/subscription-plans", element: <SubscriptionPlansPage/>},
    {path: "/taxonomy", element: <TaxonomyPage/>},
    {path: "/app-translations", element: <AppTranslationsPage/>},
    {path: "/admin-notifications", element: <AdminNotificationsPage/>},
    {path: "/course-moderation", element: <CourseModerationPage/>},
    {path: "/interest-quiz", element: <InterestQuizQuestionsPage/>},
    {path: "/student-professions", element: <StudentProfessionsReviewPage/>},
    {path: "/roadmap-templates", element: <RoadmapTemplatesPage/>},
    {path: "/gifts", element: <GiftsPage/>},
    {path: "/gift-orders", element: <GiftOrdersPage/>},
    {path: "/coin-settings", element: <CoinSettingsPage/>},
    {path: "/habits", element: <HabitsPage/>},
    {path: "/growth/plan", element: <PlanPage/>},
    {path: "/growth/metrics", element: <MetricsPage/>},
    {path: "/growth/marketing", element: <MarketingPage/>},
    {path: "/growth/schools", element: <SchoolsPage/>},
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
