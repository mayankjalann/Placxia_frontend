import React, { lazy } from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Layout from './components/Layout.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const RegisterStudent = lazy(() => import('./pages/RegisterStudent.jsx'));
const RegisterCompany = lazy(() => import('./pages/RegisterCompany.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
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
