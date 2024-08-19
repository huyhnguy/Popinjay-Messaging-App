import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import App from "./App";
import LogIn from "./LogIn";
import SignUp from "./SignUp";

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
]);

export default function Router() {
    return(
        <RouterProvider router={router} />
    )
}