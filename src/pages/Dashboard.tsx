
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useDiscussions } from "@/context/DiscussionContext";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { complaints } = useComplaints();
  const { discussions } = useDiscussions();
  const navigate = useNavigate();
  
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    escalated: 0,
    resolved: 0,
    rejected: 0
  });
  
  const [discussionStats, setDiscussionStats] = useState({
    total: 0,
    totalComments: 0,
    mostActive: [] as { category: string; count: number }[]
  });
  
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "mla" && user?.role !== "district" && user?.role !== "central")) {
      navigate("/");
      return;
    }
    
    // Calculate complaint statistics
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "pending").length,
      reviewing: complaints.filter(c => c.status === "reviewing").length,
      escalated: complaints.filter(c => c.status === "escalated").length,
      resolved: complaints.filter(c => c.status === "resolved").length,
      rejected: complaints.filter(c => c.status === "rejected").length
    };
    setComplaintStats(stats);
    
    // Get recent complaints (only show relevant complaints based on role)
    const relevantComplaints = user?.role === "mla" 
      ? complaints 
      : user?.role === "district" 
        ? complaints.filter(c => c.status === "escalated")
        : complaints;
    
    const sorted = [...relevantComplaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentComplaints(sorted.slice(0, 5));
    
    // Calculate discussion statistics
    const totalComments = discussions.reduce((sum, d) => sum + d.comments.length, 0);
    
    // Count discussions by category
    const categoryCount = discussions.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and sort by count
    const mostActive = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    setDiscussionStats({
      total: discussions.length,
      totalComments,
      mostActive
    });
  }, [isAuthenticated, user, complaints, discussions, navigate]);

  if (!isAuthenticated || (user?.role !== "mla" && user?.role !== "district" && user?.role !== "central")) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {user.role === "mla" ? "MLA Dashboard" : 
             user.role === "district" ? "District Authority Dashboard" : 
             "Central Authority Dashboard"}
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Complaints</CardDescription>
              <CardTitle className="text-2xl">{complaintStats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-2xl">{complaintStats.pending}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-2xl">{complaintStats.reviewing + complaintStats.escalated}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-2xl">{complaintStats.resolved}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="complaints" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="complaints">Recent Complaints</TabsTrigger>
            <TabsTrigger value="discussions">Community Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="complaints" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>
                    {user?.role === "mla" ? "Latest complaints from your constituents" : 
                     user?.role === "district" ? "Complaints escalated to district authority" : 
                     "Overview of all complaints"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {recentComplaints.map((complaint) => (
                        <div 
                          key={complaint.id}
                          className="flex justify-between items-start p-3 rounded-md border hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                        >
                          <div>
                            <h3 className="font-medium">{complaint.title}</h3>
                            <p className="text-sm text-gray-500">
                              {complaint.category} • {complaint.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded capitalize ${
                            complaint.status === "resolved" ? "bg-green-100 text-green-800" :
                            complaint.status === "reviewing" ? "bg-blue-100 text-blue-800" :
                            complaint.status === "escalated" ? "bg-yellow-100 text-yellow-800" :
                            complaint.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {complaint.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No complaints to display</p>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/complaints")}
                    >
                      View All Complaints
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">{complaintStats.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gray-500 h-2.5 rounded-full" 
                        style={{ width: `${complaintStats.total ? (complaintStats.pending / complaintStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Reviewing</span>
                      <span className="text-sm font-medium">{complaintStats.reviewing}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${complaintStats.total ? (complaintStats.reviewing / complaintStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Escalated</span>
                      <span className="text-sm font-medium">{complaintStats.escalated}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${complaintStats.total ? (complaintStats.escalated / complaintStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Resolved</span>
                      <span className="text-sm font-medium">{complaintStats.resolved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${complaintStats.total ? (complaintStats.resolved / complaintStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Rejected</span>
                      <span className="text-sm font-medium">{complaintStats.rejected}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${complaintStats.total ? (complaintStats.rejected / complaintStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.role === "mla" && complaintStats.pending > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <h3 className="font-medium">Review Pending Complaints</h3>
                          <p className="text-sm text-gray-500">
                            You have {complaintStats.pending} pending complaints to review
                          </p>
                        </div>
                        <Button 
                          onClick={() => navigate("/complaints")}
                          size="sm"
                        >
                          Review
                        </Button>
                      </div>
                    )}
                    
                    {user?.role === "district" && complaintStats.escalated > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <h3 className="font-medium">Address Escalated Issues</h3>
                          <p className="text-sm text-gray-500">
                            {complaintStats.escalated} issues have been escalated to district level
                          </p>
                        </div>
                        <Button 
                          onClick={() => navigate("/complaints")}
                          size="sm"
                        >
                          Address
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-3 rounded-md border">
                      <div>
                        <h3 className="font-medium">Engage with Community</h3>
                        <p className="text-sm text-gray-500">
                          Join ongoing discussions to interact with constituents
                        </p>
                      </div>
                      <Button 
                        onClick={() => navigate("/discussions")}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="discussions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Total Discussions</h3>
                      <p className="text-3xl font-bold">{discussionStats.total}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Total Comments</h3>
                      <p className="text-3xl font-bold">{discussionStats.totalComments}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
                      <p className="text-3xl font-bold">
                        {discussionStats.total ? (discussionStats.totalComments / discussionStats.total).toFixed(1) : 0}
                      </p>
                      <p className="text-xs text-gray-500">Comments per discussion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Active Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  {discussionStats.mostActive.length > 0 ? (
                    <div className="space-y-4">
                      {discussionStats.mostActive.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm">{item.count} discussions</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-socialize-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(item.count / discussionStats.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No discussion data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
                <CardDescription>
                  Analyze community interests and concerns to better serve your constituents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Based on recent discussions and complaints, here are some key insights:
                  </p>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Top Community Concerns</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {discussionStats.mostActive.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-gray-700">
                          {item.category} ({item.count} discussions)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Recommended Actions</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li className="text-gray-700">
                        Organize community meetings focused on the most discussed topics
                      </li>
                      <li className="text-gray-700">
                        Provide regular updates on resolved complaints to build trust
                      </li>
                      <li className="text-gray-700">
                        Engage directly in discussions to show community involvement
                      </li>
                    </ul>
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button 
                      onClick={() => navigate("/discussions")}
                    >
                      Join Community Discussions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
