import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset request failed");
      }

      // Show success message
      setMessage("If the email is registered, we have sent you a reset link! We will redirect you in 10 seconds!");
      setLoading(false);
      localStorage.setItem("email_to_reset", email);
      setTimeout(() => navigate("/reset-password"), 10000);
    } catch (error) {
      setError(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-500 mb-6 text-sm">Enter your email to reset password</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md transition duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-gray-600 hover:underline">
            Remembered your password? Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
