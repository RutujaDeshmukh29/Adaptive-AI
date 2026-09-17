"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { fetchApi, setToken } from "@/lib";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const data = await fetchApi<{ access_token: string; user: { role: string } }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      
      setToken(data.access_token);
      if (role === "parent") {
        router.push("/parent-dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.detail || "Signup failed");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started with AdaptEd AI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === "student"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>🎓 Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === "parent"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>👨‍👩‍👧 Parent</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Riya Sharma" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
