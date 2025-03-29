
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useComplaints, ComplaintStatus } from "@/context/ComplaintContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "escalated", label: "Escalated to District" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" }
];

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { complaints, updateComplaintStatus, addComment } = useComplaints();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(
    complaints.find((c) => c.id === id)
  );
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || "pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const foundComplaint = complaints.find((c) => c.id === id);
    
    if (!foundComplaint) {
      toast.error("Complaint not found");
      navigate("/complaints");
      return;
    }
    
    setComplaint(foundComplaint);
    setNewStatus(foundComplaint.status);
  }, [id, complaints, isAuthenticated, navigate]);

  if (!complaint || !isAuthenticated) {
    return null;
  }

  const handleStatusChange = async () => {
    if (newStatus === complaint.status) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(complaint.id, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canChangeStatus = user?.role === "mla" || 
    (user?.role === "district" && complaint.status === "escalated") ||
    user?.role === "central";

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
          <h1 className="text-2xl font-bold">Complaint Details</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{complaint.title}</CardTitle>
                <CardDescription>
                  Submitted by {complaint.userName} on{" "}
                  {format(new Date(complaint.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${
                complaint.status === "resolved" ? "bg-green-100 text-green-800" :
                complaint.status === "reviewing" ? "bg-blue-100 text-blue-800" :
                complaint.status === "escalated" ? "bg-yellow-100 text-yellow-800" :
                complaint.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {complaint.status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                <p className="text-gray-700">{complaint.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-700">{complaint.location}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-700">
                {format(new Date(complaint.updatedAt), "PPP 'at' h:mm a")}
              </p>
            </div>
          </CardContent>
          {canChangeStatus && (
            <CardFooter className="flex flex-col items-start">
              <h3 className="text-sm font-medium mb-2">Update Status</h3>
              <div className="flex gap-4 w-full">
                <Select
                  value={newStatus}
                  onValueChange={(value: ComplaintStatus) => setNewStatus(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusChange}
                  disabled={newStatus === complaint.status || isSubmitting}
                >
                  Update
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>
          
          <Separator />
          
          <div className="space-y-4">
            {complaint.comments.length > 0 ? (
              [...complaint.comments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {comment.userName}
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded capitalize ${
                              comment.userRole === "mla" ? "bg-blue-100 text-blue-800" :
                              comment.userRole === "district" ? "bg-purple-100 text-purple-800" :
                              comment.userRole === "central" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {comment.userRole}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), "PPP 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No comments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComplaintDetail;
