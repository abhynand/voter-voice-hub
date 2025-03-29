
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
import { useDiscussions } from "@/context/DiscussionContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const categories = [
  "Parks & Recreation",
  "Transportation",
  "Healthcare",
  "Education",
  "Public Safety",
  "Environment",
  "Housing",
  "Infrastructure",
  "Community Events",
  "Government Policy",
  "Other"
];

const DiscussionNew = () => {
  const { isAuthenticated } = useAuth();
  const { createDiscussion } = useDiscussions();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to start a discussion");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createDiscussion({
        title,
        content,
        category
      });
      
      toast.success("Discussion created successfully");
      navigate("/discussions");
    } catch (error) {
      console.error("Failed to create discussion:", error);
      toast.error("Failed to create discussion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/discussions")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Start New Discussion</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Discussion Details</CardTitle>
            <CardDescription>
              Share your thoughts or questions with the community.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Topic or question for discussion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your detailed thoughts, ideas, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  required
                />
              </div>
              
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/discussions")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Discussion"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default DiscussionNew;
