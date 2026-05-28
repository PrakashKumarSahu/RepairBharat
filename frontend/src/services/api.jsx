import axios from "axios"


export const signup = async(data)=>{
    const url = import.meta.env.VITE_API_URL + "/accounts/register/";

    try {
        
    const response = await axios.post(url,data,{headers:{"Content-Type":"application/json"}});
   
    if(response.status == 201){
        return {
            message:"created",
            status:201
        }
    }
    } catch (error) {
        if(error.response.status == 400){
        return {
            message:"error",
            status:400,
            data:error.response.data
        }
    }
    else{

    }
    }



    
    
}