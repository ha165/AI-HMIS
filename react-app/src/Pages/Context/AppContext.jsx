import { createContext, useState} from "react";

export const AppContext = createContext();

export default function AppProvider(children) {
   const [token, setToken] = useState("localstorage.getItem('token')");
    return (
        <AppContext.Provider value={{token,setToken}}>
            {children}
        </AppContext.Provider> 
    )
}