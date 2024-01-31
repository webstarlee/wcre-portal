import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { NotFound } from "@/pages/Errors";
import { LoadingContainer } from "@/components/StyledComponents";
import LoadingImg from "@/assets/images/loading.svg";

const Home = lazy(() => import("@/pages/Home"));
const Listing = lazy(() => import("@/pages/Listing"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));

const LoadingView: React.FC = () => {
    return (
        <LoadingContainer sx={{ height: "100%" }}>
        <img style={{ width: "40px" }} src={LoadingImg} />
      </LoadingContainer>
    );
  };

const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "*",
                element: (
                    <Suspense fallback={<LoadingView />}>
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
                    <Suspense fallback={<LoadingView />}>
                        <Home />
                    </Suspense>
                ),
            },
            {
                path: "/listings",
                element: (
                    <Suspense fallback={<LoadingView />}>
                        <Listing />
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
    {
        path: "/404",
        element: (
            <Suspense fallback={<LoadingView />}>
                <NotFound />
            </Suspense>
        ),
    },
];

const router = createBrowserRouter(routes);

export default router;