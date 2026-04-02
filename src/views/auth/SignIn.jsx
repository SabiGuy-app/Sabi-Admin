// eslint-disable
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "components/fields/InputField";
import { FcGoogle } from "react-icons/fc";
import Checkbox from "components/checkbox";
import { MdCheckCircle, MdError } from "react-icons/md";
import { authAPI } from "services/api";

export default function SignIn() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setPasswordError(
        "Password must contain uppercase, lowercase, and numbers"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log(`Input changed: ${id} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");

    if (id === "password") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    console.log("Form submitted with data:", formData);

    // Validation
    if (!formData.email || !formData.password) {
      console.log(
        "Validation failed - Email:",
        formData.email,
        "Password:",
        formData.password
      );
      setError("Email and password are required");
      return;
    }

    if (isSignUp) {
      if (!formData.fullName) {
        setError("Full name is required");
        return;
      }
      if (!validatePassword(formData.password)) {
        return;
      }
    }

    try {
      setLoading(true);

      if (isSignUp) {
        // Create admin account
        const data = await authAPI.adminCreate(
          formData.email,
          formData.password,
          formData.fullName
        );

        if (!data) {
          throw new Error("Failed to create admin account");
        }

        setSuccess(true);
        setFormData({ email: "", password: "", fullName: "" });
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess(false);
        }, 2000);
      } else {
        // Login endpoint
        const data = await authAPI.adminLogin(
          formData.email,
          formData.password
        );

        if (!data) {
          throw new Error("Invalid email or password");
        }

        // Store auth token
        if (data.data.token) {
          localStorage.setItem("authToken", data.data.token);
          window.dispatchEvent(new Event("authTokenChange"));
        }
        if (data.data) {
          localStorage.setItem("user", JSON.stringify(data.data));
        }

        setSuccess(true);
        setFormData({ email: "", password: "", fullName: "" });

        // Use navigate instead of window.location.href
        setTimeout(() => {
          navigate("/admin/default");
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      {/* Auth section */}
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          {isSignUp ? "Create Admin Account" : "Sign In"}
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          {isSignUp
            ? "Enter your details to create an admin account"
            : "Enter your email and password to sign in!"}
        </p>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <MdCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {isSignUp
                ? "Admin account created successfully! Redirecting..."
                : "Logged in successfully! Redirecting to dashboard..."}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <MdError className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {!isSignUp && (
          <>
            <div className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800">
              <div className="rounded-full text-xl">
                <FcGoogle />
              </div>
              <h5 className="text-sm font-medium text-navy-700 dark:text-white">
                Sign In with Google
              </h5>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
              <p className="text-base text-gray-600 dark:text-white"> or </p>
              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          {/* Full Name - Sign Up Only */}
          {isSignUp && (
            <InputField
              variant="auth"
              extra="mb-3"
              label="Full Name*"
              placeholder="Enter your full name"
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          )}

          {/* Email */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="mail@example.com"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />

          {/* Password */}
          <div>
            <InputField
              variant="auth"
              extra={isSignUp ? "mb-1" : "mb-3"}
              label="Password*"
              placeholder={
                isSignUp
                  ? "Min. 8 chars: uppercase, lowercase, numbers"
                  : "Enter your password"
              }
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {isSignUp && passwordError && (
              <p className="mb-3 text-xs text-red-500 dark:text-red-400">
                {passwordError}
              </p>
            )}
          </div>

          {/* Checkbox - Sign In Only */}
          {!isSignUp && (
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center">
                <Checkbox />
                <p className="ml-2 text-sm font-medium text-navy-700 dark:text-white">
                  Keep me logged In
                </p>
              </div>
              {/* <a
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
                href="#"
              >
                Forgot Password?
              </a> */}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            {loading
              ? "Processing..."
              : isSignUp
              ? "Create Admin Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormData({ email: "", password: "", fullName: "" });
              setError("");
              setSuccess(false);
              setPasswordError("");
            }}
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            {isSignUp ? "Sign In" : "Create Admin Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
