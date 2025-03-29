
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type ComplaintStatus = "pending" | "reviewing" | "escalated" | "resolved" | "rejected";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  comments: ComplaintComment[];
};

export type ComplaintComment = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: "voter" | "mla" | "district" | "central";
};

type ComplaintContextType = {
  complaints: Complaint[];
  isLoading: boolean;
  createComplaint: (data: Omit<Complaint, "id" | "status" | "createdAt" | "updatedAt" | "userId" | "userName" | "comments">) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  addComment: (complaintId: string, text: string) => Promise<void>;
};

const ComplaintContext = createContext<ComplaintContextType | null>(null);

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
};

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved complaints from localStorage
    const savedComplaints = localStorage.getItem("complaints");
    if (savedComplaints) {
      try {
        setComplaints(JSON.parse(savedComplaints));
      } catch (error) {
        console.error("Failed to parse saved complaints:", error);
      }
    } else {
      // Set initial mock data if none exists
      const initialComplaints: Complaint[] = [
        {
          id: "c1",
          title: "Poor road conditions in North District",
          description: "The roads in North District have been in bad condition for months. Multiple potholes cause damage to vehicles.",
          category: "Infrastructure",
          location: "North District",
          status: "pending",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: "u1",
          userName: "John Citizen",
          comments: []
        },
        {
          id: "c2",
          title: "Garbage collection issues in Central Area",
          description: "Garbage hasn't been collected in Central Area for two weeks now. This is causing health hazards.",
          category: "Sanitation",
          location: "Central Area",
          status: "reviewing",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          userId: "u2",
          userName: "Sarah Voter",
          comments: [
            {
              id: "cmt1",
              text: "I'll look into this issue immediately.",
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              userId: "m1",
              userName: "MLA Representative",
              userRole: "mla"
            }
          ]
        },
        {
          id: "c3",
          title: "Water supply interrupted in East Zone",
          description: "We've had no water supply in East Zone for 3 days. This is causing severe difficulties for residents.",
          category: "Utilities",
          location: "East Zone",
          status: "escalated",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: "u3",
          userName: "David Constituent",
          comments: [
            {
              id: "cmt2",
              text: "This issue requires immediate attention. I'm escalating to district authorities.",
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              userId: "m1",
              userName: "MLA Representative",
              userRole: "mla"
            },
            {
              id: "cmt3",
              text: "District authority will send engineers to inspect the issue tomorrow.",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              userId: "d1",
              userName: "District Officer",
              userRole: "district"
            }
          ]
        }
      ];
      setComplaints(initialComplaints);
      localStorage.setItem("complaints", JSON.stringify(initialComplaints));
    }
    setIsLoading(false);
  }, []);

  const saveComplaints = (updatedComplaints: Complaint[]) => {
    setComplaints(updatedComplaints);
    localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
  };

  const createComplaint = async (data: Omit<Complaint, "id" | "status" | "createdAt" | "updatedAt" | "userId" | "userName" | "comments">) => {
    if (!user) {
      toast.error("You must be logged in to create a complaint");
      return;
    }
    
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const newComplaint: Complaint = {
        ...data,
        id: `c${Math.random().toString(36).substr(2, 9)}`,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        userId: user.id,
        userName: user.name,
        comments: []
      };
      
      const updatedComplaints = [newComplaint, ...complaints];
      saveComplaints(updatedComplaints);
      toast.success("Complaint submitted successfully");
    } catch (error) {
      console.error("Failed to create complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    if (!user) {
      toast.error("You must be logged in to update a complaint");
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === id) {
          return {
            ...complaint,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return complaint;
      });
      
      saveComplaints(updatedComplaints);
      toast.success(`Complaint status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update complaint status:", error);
      toast.error("Failed to update complaint status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (complaintId: string, text: string) => {
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const newComment: ComplaintComment = {
        id: `cmt${Math.random().toString(36).substr(2, 9)}`,
        text,
        createdAt: now,
        userId: user.id,
        userName: user.name,
        userRole: user.role
      };
      
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            comments: [...complaint.comments, newComment],
            updatedAt: now
          };
        }
        return complaint;
      });
      
      saveComplaints(updatedComplaints);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        isLoading,
        createComplaint,
        updateComplaintStatus,
        addComment
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};
