import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../../layout/AuthLayout";
import LoginForm from "../../components/auth/Login.tsx";

export default function SignIn() {
    return (
        <>
            <PageMeta
                title="Westep Superadmin Login"
                description="Westep superadmin kirish sahifasi"
            />
            <AuthLayout>
                <LoginForm/>
            </AuthLayout>
        </>
    );
}
