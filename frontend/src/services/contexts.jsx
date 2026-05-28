import { createContext } from "react";


const userContext = createContext(null);

export const UserContextProvider = ({children})=>{




    return <userContext.Provider value="">
        {children}
    </userContext.Provider>
}