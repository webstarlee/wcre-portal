import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { NotFound } from "@/pages/Errors";

const Home = lazy(() => import("@/pages/Home"));
const Listing = lazy(() => import("@/pages/Listing"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));

const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "*",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Navigate to="/404" />
                    </Suspense>
                ),
            },
            {
                path: "/",
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: "/dashboard",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Home />
                    </Suspense>
                ),
            },
            {
                path: "/listings",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Listing />
                    </Suspense>
                ),
            },
            {
                path: "/404",
                element: (
                    <Suspense fallback={<>...</>}>
                        <NotFound />
                    </Suspense>
                ),
            },
        ]
    },
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            {
                path: "/*",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Navigate to="/404" />
                    </Suspense>
                ),
            },
            {
                path: "/login",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Login />
                    </Suspense>
                ),
            },
            {
                path: "/register",
                element: (
                    <Suspense fallback={<>...</>}>
                        <Register />
                    </Suspense>
                ),
            },
        ]
    },
];

const router = createBrowserRouter(routes);

export default router;