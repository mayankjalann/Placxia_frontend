import React from "react";
import { Outlet } from "react-router-dom";

function Layout(){
    return(
        <div className="w-full min-h-screen bg-slate-950 text-white">
        {/* <Header /> */}
        <Outlet />
        {/* <Footer /> */}
        </div>  
    )
};

export default Layout;