import React from 'react';
import {Navigate} from 'react-router';
import {useUser} from "../api/auth/useAuth.ts";
import Spinner from "../components/common/Spinner.tsx";

const AuthProtected = ({children}: { children: React.ReactNode }) => {
    const {data: user, isLoading, isError} = useUser();
    if (isLoading) return <Spinner/>;
    if (isError || !user) return <Navigate to="/login" replace/>;

    return <>{children}</>;
};


export default AuthProtected;

