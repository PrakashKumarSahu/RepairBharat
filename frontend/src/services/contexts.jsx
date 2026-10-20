import { createContext, useContext, useEffect, useState } from "react";
import { getUserDetails } from "./api";


const userContext = createContext(null);

export const UserContextProvider = ({children})=>{
    const [user, setUser] = useState(null);
    useEffect(()=>{
        const item = JSON.parse(localStorage.getItem("token"));
        if(item){
            if((item.expiration - Date.now()) <= 0 ){
                // Token expired — clear it and force re-login
                localStorage.removeItem("token");
                setUser(null);
            }
            else{
                const fetchUser = async () => {
                    const data = await getUserDetails(item.key);
                    setUser(data);
                };
                fetchUser();
            }
        }
    },[]);
    return <userContext.Provider value={{user, setUser}}>
        {children}
    </userContext.Provider>
}




export const useUserContext = ()=>useContext(userContext);