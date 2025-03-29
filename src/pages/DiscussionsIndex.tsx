
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useDiscussions, Discussion } from "@/context/DiscussionContext";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowUp } from "lucide-react";

const DiscussionsIndex = () => {
  const { isAuthenticated, user } = useAuth();
  const { discussions, likeDiscussion } = useDiscussions();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);

  // Get unique categories for filter dropdown
  const categories = ["all", ...new Set(discussions.map(d => d.category))];

  useEffect(() => {
    let result = [...discussions];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        discussion =>
          discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(discussion => discussion.category === categoryFilter);
    }
    
    // Sort based on selected option
    if (sortBy === "recent") {
      result = result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      result = result.sort((a, b) => b.likes - a.likes);
    }
    
    setFilteredDiscussions(result);
  }, [discussions, searchTerm, categoryFilter, sortBy]);

  const handleLike = async (id: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await likeDiscussion(id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Community Discussions</h1>
          
          {isAuthenticated && (
            <Button onClick={() => navigate("/discussions/new")}>
              Start New Discussion
            </Button>
          )}
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
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
          <div>
            <Select
              value={sortBy}
              onValueChange={(value: "recent" | "popular") => setSortBy(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion) => (
              <Card key={discussion.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg hover:text-socialize-blue-600 cursor-pointer" onClick={() => navigate(`/discussions/${discussion.id}`)}>
                        {discussion.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="text-xs">Posted by {discussion.userName}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${user && discussion.likedBy.includes(user.id) ? "text-socialize-blue-600" : "text-gray-400"}`}
                          onClick={() => handleLike(discussion.id)}
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
                <p className="text-gray-500">No discussions found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscussionsIndex;
