import React from 'react';
import {Routes, Route} from 'react-router';

//routes
import {authProtectedRoutes, publicRoutes} from './allRoutes';
import AuthProtected from "./AuthProtected.tsx";
import AppLayout from "../layout/AppLayout.tsx";

const Index = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route>
                    {publicRoutes.map((route, idx) => (
                        <Route path={route.path} element={
                            route.element
                        } key={idx}/>
                    ))}
                </Route>

                <Route element={<AuthProtected>
                    <AppLayout/>
                </AuthProtected>
                }>
                    {authProtectedRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={route.element}
                            key={idx}
                        />
                    ))}
                </Route>
            </Routes>
        </React.Fragment>
    );
};

export default Index;
