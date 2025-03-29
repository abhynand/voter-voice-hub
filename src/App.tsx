
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ComplaintProvider } from "@/context/ComplaintContext";
import { DiscussionProvider } from "@/context/DiscussionContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ComplaintsIndex from "./pages/ComplaintsIndex";
import ComplaintDetail from "./pages/ComplaintDetail";
import ComplaintNew from "./pages/ComplaintNew";
import DiscussionsIndex from "./pages/DiscussionsIndex";
import DiscussionDetail from "./pages/DiscussionDetail";
import DiscussionNew from "./pages/DiscussionNew";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ComplaintProvider>
        <DiscussionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/complaints" element={<ComplaintsIndex />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/complaints/new" element={<ComplaintNew />} />
                <Route path="/discussions" element={<DiscussionsIndex />} />
                <Route path="/discussions/:id" element={<DiscussionDetail />} />
                <Route path="/discussions/new" element={<DiscussionNew />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DiscussionProvider>
      </ComplaintProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
