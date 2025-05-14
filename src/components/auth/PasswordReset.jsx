import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function PasswordReset() {
  const navigate = useNavigate();
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const email = localStorage.getItem("email_to_reset");

  useEffect(() => {
    if (!email) {
      setError("No email found to reset. Please request a reset link again.");
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.43.100:8000/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token: resetCode,
            password,
            password_confirmation: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reset failed");
      }

      setSuccess(
        "Password successfully reset! We will redirect you to login now!"
      );
      setTimeout(() => {
        navigate("/login");
        localStorage.removeItem("email_to_reset");
      }, 3000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 mb-3 text-sm">
          Enter the reset code sent to your email and set your new password
        </p>

        <p className="mb-3 text-sm text-[#808080]">{email}</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="resetCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reset Code
            </label>
            <input
              id="resetCode"
              type="text"
              placeholder="Enter the reset code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              autoComplete="one-time-code"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md transition duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-xs text-gray-600 hover:underline">
            Wrong email? Edit your email!
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
