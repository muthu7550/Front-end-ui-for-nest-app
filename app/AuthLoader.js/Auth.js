"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";


export default function Auth(Component) {

  return function AuthWrapper(props) {

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
alert("called")

    useEffect(() => {

      async function checkAuth() {

        try {

          const token = localStorage.getItem("access_token");


          if (!token) {
            // router.push("/login");
            return;
          } 


        } catch(error){
alert("ccatch")

        } finally {

          setLoading(false);

        }

      }


      checkAuth();


    },[]);



    if(loading){
      return <Loading />;
    }


    return (
      <Component 
        {...props}
        user={user}
      />
    );
  };
}