import {useCallback, useEffect, useRef, useState} from "react";
import {Link, useLocation} from "react-router";
import lightLogo from "../assets/westep-logo.png";
import darkLogo from "../assets/westep-logo-dark.png";
import {
    BoltIcon,
    BoxCubeIcon,
    BoxIcon,
    BoxIconLine,
    CheckCircleIcon,
    ChevronDownIcon,
    DollarLineIcon,
    FolderIcon,
    GridIcon,
    GroupIcon,
    HorizontaLDots,
    ListIcon,
    PageIcon,
    PaperPlaneIcon,
    PlugInIcon,
    ShootingStarIcon,
    TaskIcon,
    UserCircleIcon,
    VideoIcon,
} from "../icons";
import {useSidebar} from "../context/SidebarContext";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type NavSection = {
    title: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        title: "Asosiy",
        items: [
            {
                icon: <GridIcon />,
                name: "Boshqaruv paneli",
                path: "/",
            },
            {
                icon: <TaskIcon />,
                name: "O'sish (8 hafta)",
                subItems: [
                    { name: "Reja", path: "/growth/plan" },
                    { name: "Ko'rsatkichlar", path: "/growth/metrics" },
                    { name: "Kunlik marketing", path: "/growth/marketing" },
                    { name: "Maktablar", path: "/growth/schools" },
                ],
            },
        ],
    },
    {
        title: "Ta'lim & Tarbiya",
        items: [
            {
                icon: <ShootingStarIcon />,
                name: "Kunlik odatlar",
                path: "/habits",
            },
            {
                icon: <BoxCubeIcon />,
                name: "Sovg'alar katalogi",
                path: "/gifts",
            },
            {
                icon: <BoxIconLine />,
                name: "Sovg'a buyurtmalari",
                path: "/gift-orders",
            },
            {
                icon: <DollarLineIcon />,
                name: "Coin sozlamalari",
                path: "/coin-settings",
            },
            {
                icon: <VideoIcon />,
                name: "Kurs moderatsiyasi",
                path: "/course-moderation",
            },
            {
                icon: <ListIcon />,
                name: "Roadmap shablonlari",
                path: "/roadmap-templates",
            },
            {
                icon: <BoltIcon />,
                name: "Qiziqish testi",
                path: "/interest-quiz",
            },
            {
                icon: <GroupIcon />,
                name: "Kasb tanlovlari",
                path: "/student-professions",
            },
        ],
    },
    {
        title: "B2B & Moliya",
        items: [
            {
                icon: <BoxIcon />,
                name: "Bizneslar",
                path: "/businesses",
            },
            {
                icon: <PlugInIcon />,
                name: "Biznes domenlari",
                path: "/business-domains",
            },
            {
                icon: <DollarLineIcon />,
                name: "To'lov sozlamalari",
                path: "/platform-payment-settings",
            },
            {
                icon: <CheckCircleIcon />,
                name: "Obuna paketlari",
                path: "/subscription-plans",
            },
        ],
    },
    {
        title: "Tizim & Boshqaruv",
        items: [
            {
                icon: <UserCircleIcon />,
                name: "Lavozimlar",
                path: "/roles",
            },
            {
                icon: <FolderIcon />,
                name: "Taxonomy",
                path: "/taxonomy",
            },
            {
                icon: <PageIcon />,
                name: "Ilova tillari",
                path: "/app-translations",
            },
            {
                icon: <PaperPlaneIcon />,
                name: "Bildirishnomalar",
                path: "/admin-notifications",
            },
        ],
    },
];

const AppSidebar: React.FC = () => {
    const {isExpanded, isMobileOpen, isHovered, setIsHovered} = useSidebar();
    const location = useLocation();

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isActive = useCallback(
        (path?: string) => Boolean(path && location.pathname === path),
        [location.pathname]
    );

    useEffect(() => {
        let matchedName: string | null = null;
        navSections.forEach((section) => {
            section.items.forEach((nav) => {
                if (nav.subItems?.some((subItem) => isActive(subItem.path))) {
                    matchedName = nav.name;
                }
            });
        });

        if (matchedName) {
            setOpenSubmenu(matchedName);
        }
    }, [location.pathname, isActive]);

    useEffect(() => {
        if (openSubmenu && subMenuRefs.current[openSubmenu]) {
            setSubMenuHeight((prev) => ({
                ...prev,
                [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
            }));
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (name: string) => {
        setOpenSubmenu((prev) => (prev === name ? null : name));
    };

    const isVisible = isExpanded || isHovered || isMobileOpen;

    const renderMenuItems = (items: NavItem[]) => (
        <ul className="flex flex-col gap-1.5">
            {items.map((nav) => {
                const isOpen = openSubmenu === nav.name;
                const hasActiveChild = nav.subItems?.some((si) => isActive(si.path));

                return (
                    <li key={nav.name}>
                        {nav.subItems ? (
                            <button
                                onClick={() => handleSubmenuToggle(nav.name)}
                                className={`menu-item group ${
                                    isOpen || hasActiveChild
                                        ? "menu-item-active"
                                        : "menu-item-inactive"
                                } cursor-pointer w-full ${
                                    !isVisible ? "lg:justify-center" : "lg:justify-start"
                                }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isOpen || hasActiveChild
                                            ? "menu-item-icon-active"
                                            : "menu-item-icon-inactive"
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {isVisible && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                                {isVisible && (
                                    <ChevronDownIcon
                                        className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                            isOpen ? "rotate-180 text-brand-500" : ""
                                        }`}
                                    />
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    to={nav.path}
                                    className={`menu-item group ${
                                        isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                    } ${!isVisible ? "lg:justify-center" : "lg:justify-start"}`}
                                >
                                    <span
                                        className={`menu-item-icon-size ${
                                            isActive(nav.path)
                                                ? "menu-item-icon-active"
                                                : "menu-item-icon-inactive"
                                        }`}
                                    >
                                        {nav.icon}
                                    </span>
                                    {isVisible && (
                                        <span className="menu-item-text">{nav.name}</span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems && isVisible && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[nav.name] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height: isOpen ? `${subMenuHeight[nav.name] || 160}px` : "0px",
                                }}
                            >
                                <ul className="mt-1 space-y-1 ml-9 pb-1">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                to={subItem.path}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.path)
                                                        ? "menu-dropdown-item-active"
                                                        : "menu-dropdown-item-inactive"
                                                }`}
                                            >
                                                {subItem.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
            ${
                isVisible
                    ? "w-[290px]"
                    : "w-[90px]"
            }
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-6 flex border-b border-gray-100 dark:border-gray-800/80 mb-2 ${
                    !isVisible ? "lg:justify-center" : "justify-start"
                }`}
            >
                <Link to="/" className="flex items-center gap-3">
                    {isVisible ? (
                        <>
                            <img
                                className="dark:hidden"
                                src={darkLogo}
                                alt="Westep Logo"
                                width={138}
                                height={40}
                            />
                            <img
                                className="hidden dark:block"
                                src={lightLogo}
                                alt="Westep Logo"
                                width={138}
                                height={40}
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src={darkLogo}
                                alt="Westep Logo"
                                width={44}
                                height={44}
                                className="dark:hidden object-contain"
                            />
                            <img
                                src={lightLogo}
                                alt="Westep Logo"
                                width={44}
                                height={44}
                                className="hidden dark:block object-contain"
                            />
                        </>
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1 pb-8">
                <nav className="space-y-6 pt-2">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <h2
                                className={`text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 flex items-center ${
                                    !isVisible ? "justify-center" : "justify-start px-2"
                                }`}
                            >
                                {isVisible ? (
                                    section.title
                                ) : (
                                    <HorizontaLDots className="size-4 opacity-75" />
                                )}
                            </h2>
                            {renderMenuItems(section.items)}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
