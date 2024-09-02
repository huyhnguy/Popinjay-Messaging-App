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
import DmTab from "./DmTab";
import GroupTab from "./GroupTab";
import GroupDm from "./GroupDm";

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
        path: "/dms",
        element: <DmTab />,
    },
    {
        path: "/dms/:dmId",
        element: <Dm />,
    },
    {
        path: "/settings",
        element: <Settings />,
    },
    {
        path: "/groups",
        element: <GroupTab />,
    },
    {
        path: "/groups/:groupId",
        element: <GroupDm />,
    },
]);

export default function Router() {
    return(
        <RouterProvider router={router} />
    )
}