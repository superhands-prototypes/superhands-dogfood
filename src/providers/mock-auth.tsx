import { createContext, useContext, type ReactNode } from "react";

// Mock user data for the design playground
export const mockUser = {
  id: "designer-1",
  email: "designer@superhands.io",
  user_metadata: {
    name: "Design User",
    user_name: "designer",
  },
};

interface AuthContextType {
  user: typeof mockUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        loading: false,
        signOut: () => {
          console.log("Sign out clicked (mock)");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a MockAuthProvider");
  }
  return context;
}
