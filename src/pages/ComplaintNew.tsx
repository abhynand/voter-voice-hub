
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useComplaints } from "@/context/ComplaintContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const categories = [
  "Infrastructure",
  "Sanitation",
  "Utilities",
  "Transportation",
  "Healthcare",
  "Education",
  "Public Safety",
  "Environment",
  "Housing",
  "Other"
];

const ComplaintNew = () => {
  const { isAuthenticated, user } = useAuth();
  const { createComplaint } = useComplaints();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to submit a complaint");
      navigate("/login");
    } else if (user?.role !== "voter") {
      toast.error("Only voters can submit complaints");
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createComplaint({
        title,
        description,
        category,
        location
      });
      
      toast.success("Complaint submitted successfully");
      navigate("/complaints");
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      toast.error("Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== "voter") {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/complaints")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Submit New Complaint</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>
              Please provide all the necessary details about your complaint.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title of your complaint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the issue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Specific location of the issue"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/complaints")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ComplaintNew;
