import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../public/styles/Login.css"
import axios from "axios";
import { toast } from "react-toastify";
export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const apiUrl = 'http://localhost:8080';

const handleSignup = async (e) => {
  e.preventDefault();

  try {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }

    const result = await axios.post(`${apiUrl}/Auth/SignUp`, {
      name,
      email,
      password
    });

    // For success (201 ideally)
    toast.success("User Registered Successfully!");
    navigate("/Login");

  } catch (err) {
    console.log(err)
    if (err?.response) {
      if (err.response.status === 409) {
        toast.error("User Already Exists");
      } else if (err.response.status === 400) {
        toast.error("All fields are required");
      } else if (err.response.status === 500) {
        toast.error("Server error occurred");
      }
    } else {
      toast.error("Network error");
    }
  }
};


  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSignup}>
        <h2 className="login-title">Create Account</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        <p className="signup-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}
