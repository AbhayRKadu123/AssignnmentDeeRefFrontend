import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../public/styles/Login.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  // const apiUrl = "http://localhost:8080";
    const apiUrl="https://assignmentdeerefbackend.onrender.com"


  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(`${apiUrl}/`);
        console.log("Data:", result?.data?.Msg);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email or Password cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/Auth/Login`, {
        email,
        password,
      });

      toast.success("Login Successful!");

      // Optional: Save token (if backend sends)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      navigate("/");
    } catch (err) {
      console.log("Login error:", err);

      const message = err.response?.data?.err || "Login failed!";
      toast.error(message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h2 className="login-title">Welcome Back</h2>

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

        <button type="submit">Login</button>

        <p className="signup-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}
