import React from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useRouteError } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { lazyWithRecovery } from './utils/lazyWithRecovery.js';

const Login = lazyWithRecovery(() => import('./pages/Login.jsx'));
const RegisterStudent = lazyWithRecovery(() => import('./pages/RegisterStudent.jsx'));
const RegisterCompany = lazyWithRecovery(() => import('./pages/RegisterCompany.jsx'));
const Dashboard = lazyWithRecovery(() => import('./pages/Dashboard.jsx'));
const Home = lazyWithRecovery(() => import('./pages/Home.jsx'));
const Profile = lazyWithRecovery(() => import('./pages/Profile.jsx'));

const RouteError = () => {
    const error = useRouteError();
    console.error('Route failed to load:', error);
    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
            <div className="max-w-md text-center">
                <h1 className="text-3xl font-semibold">This page could not be loaded</h1>
                <p className="mt-3 text-sm text-zinc-400">The app may have just been updated. Reload to get the latest version.</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-white px-6 py-3 font-medium text-black">Reload app</button>
            </div>
        </main>
    );
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<RouteError />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register-student" element={<RegisterStudent />} />
            <Route path="register-company" element={<RegisterCompany />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
        </Route>
    )
);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
