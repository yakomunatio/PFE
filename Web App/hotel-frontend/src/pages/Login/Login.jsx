import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://192.168.137.155:5000/login", {
        username,
        password,
      });
      if (response.data.role === "admin") {
        navigate("/admin");
      } else if (response.data.role === "customer") {
        navigate("/customer", { state: { roomNumber: password } });
      }
    } catch (error) {
      alert("Invalid login credentials!");
    }
  };

  return (
    <div className="bakground">
      <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      </form>
    </div>
    </div>
  );
};

export default Login;
