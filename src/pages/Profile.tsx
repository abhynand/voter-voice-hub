
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useComplaints } from "@/context/ComplaintContext";
import { useDiscussions } from "@/context/DiscussionContext";
import { User } from "lucide-react";

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { complaints } = useComplaints();
  const { discussions } = useDiscussions();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Count stats related to the user
  const userComplaints = complaints.filter(c => c.userId === user.id);
  const userDiscussions = discussions.filter(d => d.userId === user.id);
  const userComments = discussions.reduce((count, discussion) => {
    return count + discussion.comments.filter(c => c.userId === user.id).length;
  }, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Your Profile</h1>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-socialize-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-socialize-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>
                  <span className="capitalize">{user.role}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-2xl font-bold text-socialize-blue-700">{userComplaints.length}</p>
                <p className="text-sm text-gray-600">Complaints</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-2xl font-bold text-socialize-blue-700">{userDiscussions.length}</p>
                <p className="text-sm text-gray-600">Discussions</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-2xl font-bold text-socialize-blue-700">{userComments}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <Input id="voterId" value={user.voterId} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="joinedOn">Role</Label>
                <Input id="role" value={user.role} className="capitalize" readOnly />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
              >
                Settings
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
