import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import App from "./App";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import UserTab from "./UserTab";
import Dm from "./Dm";
import Settings from "./Settings";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/login",
        element: <LogIn />,
    },
    {
        path: "/signup",
        element: <SignUp />,
    },
    {
        path: "/users",
        element: <UserTab />,
    },
    {
        path: "/dms/:dmId",
        element: <Dm />,
    },
    {
        path: "/settings",
        element: <Settings />,
    },
]);

export default function Router() {
    return(
        <RouterProvider router={router} />
    )
}