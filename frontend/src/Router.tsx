import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import LogIn from "./views/LogIn";
import SignUp from "./views/SignUp";
import UserTab from "./views/UserTab";
import Dm from "./views/Dm";
import Settings from "./views/Settings";
import DmTab from "./views/DmTab";
import GroupTab from "./views/GroupTab";
import GroupDm from "./views/GroupDm";
import GroupSettings from "./views/GroupSettings";
import NotificationTab from "./views/NotificationTab";

const router = createBrowserRouter([
    {
        path: "/",
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
    {
        path: "/groups/:groupId/settings",
        element: <GroupSettings />,
    },
    {
        path: "/notifications",
        element: <NotificationTab />,
    },
]);

export default function Router() {
    return(
        <RouterProvider router={router} />
    )
}