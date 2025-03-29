
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useDiscussions, Discussion } from "@/context/DiscussionContext";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowUp } from "lucide-react";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const { complaints } = useComplaints();
  const { discussions } = useDiscussions();
  const navigate = useNavigate();
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [popularDiscussions, setPopularDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    // Get 3 most recent complaints
    const sortedComplaints = [...complaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentComplaints(sortedComplaints.slice(0, 3));

    // Get 3 most popular discussions based on likes
    const sortedDiscussions = [...discussions].sort(
      (a, b) => b.likes - a.likes
    );
    setPopularDiscussions(sortedDiscussions.slice(0, 3));
  }, [complaints, discussions]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-r from-socialize-blue-700 to-socialize-blue-900 text-white p-8 md:p-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Socialize
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              Connect with your representatives, share concerns, and participate in community discussions.
            </p>
            {!isAuthenticated ? (
              <div className="space-x-4">
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-white text-socialize-blue-800 hover:bg-blue-50"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="text-white border-white hover:bg-socialize-blue-600"
                >
                  Login
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Button 
                  onClick={() => navigate("/complaints/new")}
                  className="bg-white text-socialize-blue-800 hover:bg-blue-50"
                >
                  Submit a Complaint
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/discussions/new")}
                  className="text-white border-white hover:bg-socialize-blue-600"
                >
                  Start a Discussion
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Role-specific welcome message */}
        {isAuthenticated && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome back, {user?.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {user?.role === "voter" && "Share your concerns and participate in community discussions to help improve your constituency."}
              {user?.role === "mla" && "Review complaints from your constituents and engage in community discussions to address their concerns."}
              {user?.role === "district" && "Collaborate with MLAs and review escalated complaints to help resolve community issues."}
              {user?.role === "central" && "Oversee district authorities and monitor policy implementation across constituencies."}
            </p>
            <div className="flex space-x-4">
              {user?.role === "voter" && (
                <>
                  <Button onClick={() => navigate("/complaints/new")}>Submit a Complaint</Button>
                  <Button variant="outline" onClick={() => navigate("/discussions")}>Join Discussions</Button>
                </>
              )}
              {user?.role === "mla" && (
                <>
                  <Button onClick={() => navigate("/complaints")}>Review Complaints</Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>View Dashboard</Button>
                </>
              )}
              {(user?.role === "district" || user?.role === "central") && (
                <>
                  <Button onClick={() => navigate("/dashboard")}>View Dashboard</Button>
                  <Button variant="outline" onClick={() => navigate("/complaints")}>Review Escalated Issues</Button>
                </>
              )}
            </div>
          </section>
        )}

        {/* Features/Value Proposition for guest users */}
        {!isAuthenticated && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Why use Socialize?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-socialize-blue-700">Direct Access</h3>
                <p className="text-gray-600">Connect directly with your elected representatives and government officials.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-socialize-blue-700">Track Complaints</h3>
                <p className="text-gray-600">Submit and track the status of your complaints and service requests.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-socialize-blue-700">Community Discussions</h3>
                <p className="text-gray-600">Join discussions about local issues and collaborate with your community.</p>
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity / Dashboard Preview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <Tabs defaultValue="complaints" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="complaints">Recent Complaints</TabsTrigger>
              <TabsTrigger value="discussions">Popular Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="complaints" className="space-y-4">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <Card key={complaint.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{complaint.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="text-xs">Posted by {complaint.userName}</span>
                            <span className="text-xs">•</span>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="px-2 py-1 text-xs rounded bg-gray-100 capitalize">
                          {complaint.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 line-clamp-2">{complaint.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-4">{complaint.category}</span>
                        <span>{complaint.location}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No complaints yet.</p>
                  </CardContent>
                </Card>
              )}
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/complaints")}
                >
                  View All Complaints
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="discussions" className="space-y-4">
              {popularDiscussions.length > 0 ? (
                popularDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{discussion.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="text-xs">Posted by {discussion.userName}</span>
                            <span className="text-xs">•</span>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-socialize-blue-700">
                            <ArrowUp className="h-3.5 w-3.5" />
                            <span>{discussion.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{discussion.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 line-clamp-2">{discussion.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="px-2 py-1 text-xs rounded bg-gray-100">
                        {discussion.category}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(`/discussions/${discussion.id}`)}
                      >
                        View Discussion
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No discussions yet.</p>
                  </CardContent>
                </Card>
              )}
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/discussions")}
                >
                  View All Discussions
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
