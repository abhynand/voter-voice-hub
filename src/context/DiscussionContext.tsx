
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type Discussion = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  comments: DiscussionComment[];
  likes: number;
  likedBy: string[];
};

export type DiscussionComment = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: "voter" | "mla" | "district" | "central";
  likes: number;
  likedBy: string[];
};

type DiscussionContextType = {
  discussions: Discussion[];
  isLoading: boolean;
  createDiscussion: (data: Omit<Discussion, "id" | "createdAt" | "updatedAt" | "userId" | "userName" | "comments" | "likes" | "likedBy">) => Promise<void>;
  addComment: (discussionId: string, text: string) => Promise<void>;
  likeDiscussion: (discussionId: string) => Promise<void>;
  likeComment: (discussionId: string, commentId: string) => Promise<void>;
};

const DiscussionContext = createContext<DiscussionContextType | null>(null);

export const useDiscussions = () => {
  const context = useContext(DiscussionContext);
  if (!context) {
    throw new Error("useDiscussions must be used within a DiscussionProvider");
  }
  return context;
};

export const DiscussionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved discussions from localStorage
    const savedDiscussions = localStorage.getItem("discussions");
    if (savedDiscussions) {
      try {
        setDiscussions(JSON.parse(savedDiscussions));
      } catch (error) {
        console.error("Failed to parse saved discussions:", error);
      }
    } else {
      // Set initial mock data if none exists
      const initialDiscussions: Discussion[] = [
        {
          id: "d1",
          title: "New park proposal for city center",
          content: "I believe our community needs a new park in the city center. It would provide a great space for families and children.",
          category: "Parks & Recreation",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          userId: "u1",
          userName: "John Citizen",
          comments: [
            {
              id: "dcmt1",
              text: "I strongly support this idea! Our community needs more green spaces.",
              createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
              userId: "u2",
              userName: "Sarah Voter",
              userRole: "voter",
              likes: 5,
              likedBy: ["u3", "u4", "m1", "d1", "u6"]
            },
            {
              id: "dcmt2",
              text: "This is a good proposal. I'll discuss this with the relevant department in our next meeting.",
              createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
              userId: "m1",
              userName: "MLA Representative",
              userRole: "mla",
              likes: 12,
              likedBy: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12"]
            }
          ],
          likes: 24,
          likedBy: [
            "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", 
            "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", 
            "u19", "u20", "u21", "u22", "m1", "d1", "c1"
          ]
        },
        {
          id: "d2",
          title: "Improving public transportation",
          content: "We need more bus routes connecting the suburban areas to the city center. Current options are limited and overcrowded.",
          category: "Transportation",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          userId: "u3",
          userName: "David Constituent",
          comments: [],
          likes: 8,
          likedBy: ["u1", "u2", "u4", "u5", "u6", "u7", "u8", "m1"]
        }
      ];
      setDiscussions(initialDiscussions);
      localStorage.setItem("discussions", JSON.stringify(initialDiscussions));
    }
    setIsLoading(false);
  }, []);

  const saveDiscussions = (updatedDiscussions: Discussion[]) => {
    setDiscussions(updatedDiscussions);
    localStorage.setItem("discussions", JSON.stringify(updatedDiscussions));
  };

  const createDiscussion = async (data: Omit<Discussion, "id" | "createdAt" | "updatedAt" | "userId" | "userName" | "comments" | "likes" | "likedBy">) => {
    if (!user) {
      toast.error("You must be logged in to create a discussion");
      return;
    }
    
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const newDiscussion: Discussion = {
        ...data,
        id: `d${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        userId: user.id,
        userName: user.name,
        comments: [],
        likes: 0,
        likedBy: []
      };
      
      const updatedDiscussions = [newDiscussion, ...discussions];
      saveDiscussions(updatedDiscussions);
      toast.success("Discussion created successfully");
    } catch (error) {
      console.error("Failed to create discussion:", error);
      toast.error("Failed to create discussion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (discussionId: string, text: string) => {
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const newComment: DiscussionComment = {
        id: `dcmt${Math.random().toString(36).substr(2, 9)}`,
        text,
        createdAt: now,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        likes: 0,
        likedBy: []
      };
      
      const updatedDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            comments: [...discussion.comments, newComment],
            updatedAt: now
          };
        }
        return discussion;
      });
      
      saveDiscussions(updatedDiscussions);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const likeDiscussion = async (discussionId: string) => {
    if (!user) {
      toast.error("You must be logged in to like a discussion");
      return;
    }
    
    try {
      const updatedDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          const alreadyLiked = discussion.likedBy.includes(user.id);
          
          if (alreadyLiked) {
            // Unlike if already liked
            return {
              ...discussion,
              likes: discussion.likes - 1,
              likedBy: discussion.likedBy.filter(id => id !== user.id)
            };
          } else {
            // Like if not already liked
            return {
              ...discussion,
              likes: discussion.likes + 1,
              likedBy: [...discussion.likedBy, user.id]
            };
          }
        }
        return discussion;
      });
      
      saveDiscussions(updatedDiscussions);
    } catch (error) {
      console.error("Failed to like/unlike discussion:", error);
      toast.error("Failed to update like status. Please try again.");
    }
  };

  const likeComment = async (discussionId: string, commentId: string) => {
    if (!user) {
      toast.error("You must be logged in to like a comment");
      return;
    }
    
    try {
      const updatedDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          const updatedComments = discussion.comments.map(comment => {
            if (comment.id === commentId) {
              const alreadyLiked = comment.likedBy.includes(user.id);
              
              if (alreadyLiked) {
                // Unlike if already liked
                return {
                  ...comment,
                  likes: comment.likes - 1,
                  likedBy: comment.likedBy.filter(id => id !== user.id)
                };
              } else {
                // Like if not already liked
                return {
                  ...comment,
                  likes: comment.likes + 1,
                  likedBy: [...comment.likedBy, user.id]
                };
              }
            }
            return comment;
          });
          
          return {
            ...discussion,
            comments: updatedComments
          };
        }
        return discussion;
      });
      
      saveDiscussions(updatedDiscussions);
    } catch (error) {
      console.error("Failed to like/unlike comment:", error);
      toast.error("Failed to update like status. Please try again.");
    }
  };

  return (
    <DiscussionContext.Provider
      value={{
        discussions,
        isLoading,
        createDiscussion,
        addComment,
        likeDiscussion,
        likeComment
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
