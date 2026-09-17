"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    academic_level: "High School",
    subject: "Python",
    goal: "Learn the basics",
    experience_level: "beginner",
    study_time_minutes: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetchApi("/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify({ ...formData, preferences: {} }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.detail || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center pt-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome! Let's set up your profile.</CardTitle>
          <CardDescription>We need a little info to tailor the AI to your exact level.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Level</Label>
              <Input 
                value={formData.academic_level}
                onChange={e => setFormData({...formData, academic_level: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subject to Learn</Label>
              <Input 
                value={formData.subject}
                disabled
              />
              <p className="text-xs text-slate-500">Currently only Python is supported in this demo.</p>
            </div>
            
            <div className="space-y-2">
              <Label>What is your goal?</Label>
              <Input 
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select 
                value={formData.experience_level} 
                onValueChange={v => setFormData({...formData, experience_level: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Saving..." : "Start Learning"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
