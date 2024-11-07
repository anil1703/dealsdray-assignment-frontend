import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Header.css";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { NavLink, useNavigate } from 'react-router-dom';  // Import NavLink and useNavigate
import Cookies from "js-cookie";
import { useEffect, useState } from 'react';

const Header = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();  // Initialize useNavigate hook for programmatic navigation

  // Fetch username from cookies on component mount
  useEffect(() => {
    const name = Cookies.get("username");
    if (name) {
      setUsername(name);
    }
  }, []);  // Add empty dependency array to avoid infinite re-renders

  // Handle logout and redirect to login page
  const logingOut = () => {
    Cookies.remove("usersname");
    Cookies.remove("jwt_token");
    navigate("/login");  // Use navigate to redirect to login page after logout
  };

  return (
    <Navbar bg="info" data-bs-theme="light" className="px-3"> {/* Adding theme and padding */}
      <Container>
        <Navbar.Brand href="#home">LOGO</Navbar.Brand>

        {/* Navigation links */}
        <Nav className="me-auto">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} // Set active class
          >
            Home
          </NavLink>
          <NavLink 
            to="/employeeList" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Employee list
          </NavLink>
        </Nav>

        {/* Toggle and collapsing content */}
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Signed in as: <a href="#login">{username}</a>
          </Navbar.Text>
          <button className="logOutButton" onClick={logingOut}>Logout</button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
