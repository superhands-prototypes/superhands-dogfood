import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Waitlist() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("waitlist_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 bg-background">
      <div className="flex flex-col gap-6 w-full max-w-3xl">
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

        <div className="w-full max-w-3xl bg-card rounded-[18px] border border-border shadow-md overflow-hidden">
          <div className="py-4 px-8 bg-green-500/10">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-lg font-semibold text-foreground leading-tight">
                You're on the waitlist
              </h2>
            </div>
          </div>

          <div className="border-t border-green-500/20" />
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-2 text-center leading-tight">
              Want to jump the queue?
            </h3>
            {email && (
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Your email: <span className="font-medium text-foreground select-all">{email}</span>
              </p>
            )}
            {!email && <div className="mb-4" />}

            <p className="text-center text-muted-foreground mb-6">
              Book a demo call to get early access to SuperHands.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => window.open("https://calendar.google.com", "_blank")}
              >
                Book a Demo
              </Button>
              <Link to="/login">
                <Button variant="outline">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
