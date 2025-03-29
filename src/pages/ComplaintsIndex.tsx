
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useComplaints, Complaint, ComplaintStatus } from "@/context/ComplaintContext";
import { formatDistanceToNow } from "date-fns";

const ComplaintsIndex = () => {
  const { isAuthenticated, user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);

  // Get unique categories for filter dropdown
  const categories = ["all", ...new Set(complaints.map(c => c.category))];

  useEffect(() => {
    let result = [...complaints];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        complaint =>
          complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(complaint => complaint.category === categoryFilter);
    }
    
    // Only show user's complaints for voter role
    if (user?.role === "voter") {
      result = result.filter(complaint => complaint.userId === user.id);
    }
    
    // Sort by most recent
    result = result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setFilteredComplaints(result);
  }, [complaints, searchTerm, statusFilter, categoryFilter, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Complaints</h1>
          
          {user?.role === "voter" && (
            <Button onClick={() => navigate("/complaints/new")}>
              Submit New Complaint
            </Button>
          )}
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onValueChange={(value: ComplaintStatus | "all") => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaints Section */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          {["all", "pending", "reviewing", "escalated", "resolved", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredComplaints.length > 0 ? (
                filteredComplaints
                  .filter(complaint => tab === "all" || complaint.status === tab)
                  .map((complaint) => (
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
                    <p className="text-gray-500">No complaints found matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default ComplaintsIndex;
