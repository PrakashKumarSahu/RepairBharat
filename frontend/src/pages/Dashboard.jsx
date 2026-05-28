import React, { useEffect, useMemo, useState } from 'react';
import {
	FiArrowRight,
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiLogOut,
	FiMenu,
	FiSearch,
	FiSettings,
	FiTool,
	FiTrendingUp,
	FiUser,
	FiZap,
} from 'react-icons/fi';
import '../styles/Dashboard.css';
import { useUserContext } from '../services';
import { useNavigate } from 'react-router-dom';


export default function Dashboard() {
    const {user, setUser} =useUserContext();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(()=>{
        if(user !== null){
            setLoading(false);
        }else{
            navigate("/login",{replace:true});
        }
    },[user])
	return (
        <>
        {
            loading?<>loaidmng</>:<>hello bro</>
        }
        </>
    
	);
}
