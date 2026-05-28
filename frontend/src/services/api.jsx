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

export const signin = async(data)=>{
    const url = import.meta.env.VITE_API_URL+"/accounts/login/";
    try {
        const response = await axios.post(url,data,{headers:{"Content-Type":"application/json"}});
        console.log(response.status);
         if(response.status == 200){
            const item = {
                key:response.data.access,
                expiration: Date.now()+259200000
            }
            localStorage.setItem("token", JSON.stringify(item));

            return {
                status:200
            }
        }
    } catch (error) {
        return {
            status:401
        }
    }

}

export const getUserDetails = async(key)=>{
    const url = import.meta.env.VITE_API_URL+"/accounts/profile/";

    try{
        const response  = await axios.get(url,{headers:{
            Authorization: `Bearer ${key}`
        }});

        console.log(response.data);
    }

    catch(error){
        localStorage.removeItem("token");
        
    }
}