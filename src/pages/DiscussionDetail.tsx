
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useDiscussions } from "@/context/DiscussionContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, MessageSquare } from "lucide-react";

const DiscussionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { discussions, addComment, likeDiscussion, likeComment } = useDiscussions();
  const navigate = useNavigate();
  
  const [discussion, setDiscussion] = useState(
    discussions.find((d) => d.id === id)
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundDiscussion = discussions.find((d) => d.id === id);
    
    if (!foundDiscussion) {
      toast.error("Discussion not found");
      navigate("/discussions");
      return;
    }
    
    setDiscussion(foundDiscussion);
  }, [id, discussions, navigate]);

  if (!discussion) {
    return null;
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(discussion.id, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeDiscussion = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    await likeDiscussion(discussion.id);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    await likeComment(discussion.id, commentId);
  };

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
          <h1 className="text-2xl font-bold">Discussion</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{discussion.title}</CardTitle>
                <CardDescription>
                  Posted by {discussion.userName} on{" "}
                  {format(new Date(discussion.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                {discussion.category}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${user && discussion.likedBy.includes(user.id) ? "text-socialize-blue-600" : "text-gray-400"}`}
                  onClick={handleLikeDiscussion}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium">{discussion.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">{discussion.comments.length}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated {format(new Date(discussion.updatedAt), "PPP 'at' h:mm a")}
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <Textarea
              placeholder={isAuthenticated ? "Add a comment..." : "Login to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={!isAuthenticated}
            />
            {isAuthenticated ? (
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            ) : (
              <Button type="button" onClick={() => navigate("/login")}>
                Login to Comment
              </Button>
            )}
          </form>
          
          <Separator />
          
          <div className="space-y-4">
            {discussion.comments.length > 0 ? (
              [...discussion.comments]
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${user && comment.likedBy.includes(user.id) ? "text-socialize-blue-600" : "text-gray-400"}`}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">{comment.likes}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiscussionDetail;
