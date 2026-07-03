import Button from "../ui/button/Button.tsx";
import {Link} from "react-router";
import {PlusIcon} from "../../icons";

interface BreadcrumbProps {
    pageTitle: string;
    path?: string;
    onClick?: () => void;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({pageTitle, path}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2
                className="text-xl font-semibold text-gray-800 dark:text-white/90"
                x-text="pageName"
            >
                {pageTitle}
            </h2>
            {
                path && <Link to={path}>
                    <Button variant={'primary'} size={'sm'} startIcon={<PlusIcon/>}>
                        Qo'shish
                    </Button>
                </Link>
            }

        </div>
    );
};

export default PageBreadcrumb;
