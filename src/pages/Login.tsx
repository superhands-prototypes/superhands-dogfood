import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [success, setSuccess] = useState<string | null>(null);

  const isForgot = mode === "forgot";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate login
    setTimeout(() => {
      if (isForgot) {
        setSuccess("Now check your inbox. If there's an account with that email, a reset link has been sent.");
      } else {
        // Redirect to dashboard after "login"
        navigate("/dashboard");
      }
      setLoading(false);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Simulate Google sign in
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* SuperHands Logo */}
          <div className="flex items-center justify-center mb-0">
            <img
              src="/icon.png"
              alt="SuperHands"
              className="w-8 h-8 mr-2"
            />
            <h1 className="text-lg font-bold uppercase text-foreground">
              SUPERHANDS
            </h1>
          </div>

          <div className="w-full max-w-sm bg-card rounded-[18px] p-8 border border-border shadow-md">
            <h2 className="text-2xl font-semibold text-foreground mb-2 text-left leading-tight">
              {isForgot ? "Reset your password" : "Login Now"}
            </h2>
            {!isForgot && (
              <p className="text-sm text-foreground mb-6 text-left leading-tight">
                New?{" "}
                <a
                  href="/early-access"
                  className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  Get early access
                </a>
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {success && (
                <div className="mb-6 p-3 bg-green-900/20 rounded-md">
                  <p className="text-sm text-green-400 flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-3 bg-red-900/20 rounded-md">
                  <p className="text-sm text-white flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="grid gap-3">
                  <div className="relative">
                    <Label htmlFor="email" className="text-base font-medium text-foreground mb-2 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      disabled={loading}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary h-12 transition-all duration-200 cursor-text px-4 rounded-[8px] text-base"
                    />
                  </div>
                </div>

                {!isForgot && (
                  <div className="grid gap-3">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="password" className="text-base font-medium text-foreground">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setError(null);
                            setSuccess(null);
                          }}
                          className="text-sm text-foreground hover:text-primary transition-colors underline underline-offset-4 cursor-pointer outline-none"
                        >
                          Reset
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter Password"
                        disabled={loading}
                        autoCapitalize="none"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-secondary h-12 transition-all duration-200 cursor-text px-4 rounded-[8px] text-base"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-primary text-white font-medium rounded-[8px] transition-all hover:bg-primary/90 active:scale-[0.95] flex items-center justify-center group relative cursor-pointer"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <span className="flex items-center justify-center">
                      {isForgot ? "Send Reset Link" : "Log In"}
                    </span>
                    {!loading && (
                      <svg
                        className="w-4 h-4 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-center text-sm">
                {isForgot ? (
                  <p className="text-sm text-foreground">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-foreground hover:text-primary transition-colors underline underline-offset-4 cursor-pointer outline-none"
                    >
                      Login
                    </button>
                  </p>
                ) : null}
              </div>

              {!isForgot && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex justify-center">
                    <span className="text-sm font-medium text-foreground">
                      Or
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="w-full h-12 text-base bg-transparent border border-border text-foreground font-medium rounded-[8px] transition-colors hover:bg-muted flex items-center justify-center group relative cursor-pointer"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                  >
                    {/* Google icon */}
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="flex items-center justify-center">
                      Log In with Google
                    </span>
                    {!loading && (
                      <svg
                        className="w-4 h-4 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>

          {!isForgot && (
            <div className="w-full max-w-xs mx-auto">
              <p className="text-center text-sm text-muted-foreground">
                By logging in, you agree to our
                <br />
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
