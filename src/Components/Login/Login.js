import { Component } from "react";
import "./Login.css";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import {  Navigate } from "react-router-dom";
import Cookies from "js-cookie";

class Login extends Component {
  state = {
    email: "",
    password: "",
    user_type: "Admin",
    redirectToHome: false,
  };

 

  typingEmail = (e) => this.setState({ email: e.target.value });

  typingPassword = (e) => this.setState({ password: e.target.value });

  selectingUserType = (e) => this.setState({ user_type: e.target.value });

  submittingTheForm = (e) => {
    e.preventDefault();
    console.log("Backend URL:", process.env.REACT_APP_BACKENDURL);
    console.log(process.env);

    const { email, password, user_type } = this.state;
    const url = `http://localhost:5000/logintoAdmin`;
  
    if (!email || !password || !user_type) {
      toast.error("Please fill in all required details.");
      return;
    }
  
    // Show loading toast
    const loadingToastId = toast.loading("Logging in...");
  
    axios
      .post(url, { username:email, password})
      .then((response) => {
        console.log(response.data);
        toast.dismiss(loadingToastId); // Dismiss loading toast
        toast.success("Login successful!");
        Cookies.set("jwt_token", response.data.message.jwt_token, { expires: 4 });
        Cookies.set("username",email)
        this.setState({ redirectToHome: true });
       
      })
      .catch((error) => {
        console.error(error);
        toast.dismiss(loadingToastId); // Dismiss loading toast
        toast.error(error.response?.data?.message || "An error occurred. Please try again.");
      });
  };

  render() {
    const checkingIfToken = Cookies.get("jwt_token");
    if (checkingIfToken || this.state.redirectToHome) {
      return <Navigate to="/" />;
    }

    return (
      <div className="loginContainer">
        <div className="login-banner-div">
          <img src="https://res.cloudinary.com/dafmi9027/image/upload/v1730868174/Authentication_1_wgng71.png" className="login-banner-style" alt="login banner" />
        </div>
        <div className="login-content-div">
         <p>LOGO</p>
          <p>Welcome to Admin login 👋🏻</p>
          <p style={{ fontSize: "13px", color: "gray" }}>
            Please sign in to your account and start the adventure
          </p>
          <form onSubmit={this.submittingTheForm} className="formStyle">
            <input
              type="text"
              placeholder="Username"
              className="inputStyle"
              aria-label="Email"
              onChange={this.typingEmail}
            />
            <input
              type="password"
              placeholder="Password"
              className="inputStyle"
              aria-label="Password"
              onChange={this.typingPassword}
            />
            
           
            <button type="submit" className="sign-style-button">
              Sign in
            </button>
          </form>
         
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
  }
}

export default Login;
