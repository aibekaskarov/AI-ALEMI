import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { useEffect } from "react";

import styles from "./css/global.module.css"

function App() {

useEffect(() => {
    document.body.style.backgroundColor = '#DFE6EA';
  
    return () => {
      document.body.style.backgroundColor = ''; 
    };
  }, []);


  return (
    <BrowserRouter>
        <AppRoutes/>
    </BrowserRouter>
  );
}

export default App;