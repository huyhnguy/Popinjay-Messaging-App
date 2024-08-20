import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import App from "./App";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import GroupTab from "./GroupTab";

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
        path: "/groups",
        element: <GroupTab />,
    },
]);

export default function Router() {
    return(
        <RouterProvider router={router} />
    )
}