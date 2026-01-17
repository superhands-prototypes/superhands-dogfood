import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EarlyAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate waitlist signup
    setTimeout(() => {
      navigate("/waitlist");
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
              Get early access
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-left leading-tight">
              We're gradually rolling out access and would love to get you onboarded as soon as possible.
            </p>

            <form onSubmit={handleSubmit} noValidate>
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
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary h-12 transition-all duration-200 cursor-text px-4 rounded-[8px] text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-primary text-white font-medium rounded-[8px] transition-all hover:bg-primary/90 active:scale-[0.95] flex items-center justify-center group relative cursor-pointer"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <span className="flex items-center justify-center">
                      Join Waitlist
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
                <p className="text-sm text-foreground">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
