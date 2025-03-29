
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useDiscussions, Discussion } from "@/context/DiscussionContext";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  type: "complaint_status" | "complaint_comment" | "discussion_comment" | "discussion_like";
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link: string;
};

const Notifications = () => {
  const { isAuthenticated, user } = useAuth();
  const { complaints } = useComplaints();
  const { discussions } = useDiscussions();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate mock notifications based on complaints and discussions
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    
    const mockNotifications: Notification[] = [];
    
    // Add notifications for complaint status updates
    complaints.forEach((complaint) => {
      if (complaint.userId === user.id && complaint.status !== "pending") {
        mockNotifications.push({
          id: `notif-${complaint.id}-status`,
          type: "complaint_status",
          title: "Complaint Status Updated",
          description: `Your complaint "${complaint.title}" has been updated to ${complaint.status}`,
          createdAt: complaint.updatedAt,
          read: false,
          link: `/complaints/${complaint.id}`
        });
      }
    });
    
    // Add notifications for complaint comments
    complaints.forEach((complaint) => {
      if (complaint.userId === user.id) {
        complaint.comments.forEach((comment, index) => {
          if (comment.userId !== user.id) {
            mockNotifications.push({
              id: `notif-${complaint.id}-comment-${index}`,
              type: "complaint_comment",
              title: "New Comment on Your Complaint",
              description: `${comment.userName} commented on your complaint "${complaint.title}"`,
              createdAt: comment.createdAt,
              read: false,
              link: `/complaints/${complaint.id}`
            });
          }
        });
      }
    });
    
    // Add notifications for discussion comments
    discussions.forEach((discussion) => {
      if (discussion.userId === user.id) {
        discussion.comments.forEach((comment, index) => {
          if (comment.userId !== user.id) {
            mockNotifications.push({
              id: `notif-${discussion.id}-comment-${index}`,
              type: "discussion_comment",
              title: "New Comment on Your Discussion",
              description: `${comment.userName} commented on your discussion "${discussion.title}"`,
              createdAt: comment.createdAt,
              read: false,
              link: `/discussions/${discussion.id}`
            });
          }
        });
      }
    });
    
    // Add notifications for discussion likes
    discussions.forEach((discussion) => {
      if (discussion.userId === user.id && discussion.likes > 0) {
        mockNotifications.push({
          id: `notif-${discussion.id}-likes`,
          type: "discussion_like",
          title: "Your Discussion is Getting Attention",
          description: `Your discussion "${discussion.title}" has received ${discussion.likes} likes`,
          createdAt: discussion.updatedAt,
          read: false,
          link: `/discussions/${discussion.id}`
        });
      }
    });
    
    // Sort by most recent
    mockNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [isAuthenticated, user, complaints, discussions, navigate]);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-socialize-blue-700" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-socialize-blue-100 text-socialize-blue-800">
                {unreadCount} new
              </span>
            )}
          </div>
          
          {notifications.length > 0 && (
            <Button 
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <div 
                      className={`flex items-start p-4 rounded-md ${notification.read ? "bg-white" : "bg-socialize-blue-50"}`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-medium ${notification.read ? "text-gray-800" : "text-socialize-blue-800"}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsRead(notification.id);
                            navigate(notification.link);
                          }}
                        >
                          View
                        </Button>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications yet</h3>
                <p className="text-gray-500">
                  When you receive notifications, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
