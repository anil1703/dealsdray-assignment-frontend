import Login from './Components/Login/Login';
import './App.css';
import { Routes,Route } from 'react-router-dom';
import ReactContext from './ReactContext';

import Home from './Components/Home/Home';


import Employee from './Components/Employee/Employee';

function App() {
  return (
    <div>
      
      <Routes>
        <Route exact path='/login' element={<Login/>}/>
        <Route 
          path="/" 
          element={
            <ReactContext element={<Home />} />
          }
        />

      <Route 
          path="/employeeList" 
          element={
            <ReactContext element={<Employee />} />
          }
        />    
        </Routes>

    </div>
  );
}

export default App;
