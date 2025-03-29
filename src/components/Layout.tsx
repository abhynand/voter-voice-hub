
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  to: string;
  children: React.ReactNode;
  end?: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-socialize-blue-100 text-socialize-blue-800"
          : "text-socialize-gray-600 hover:bg-socialize-blue-50 hover:text-socialize-blue-700"
      )}
    >
      {children}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="socialize-container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-socialize-blue-600">
                  Socialize
                </span>
              </Link>
              
              {isAuthenticated && (
                <nav className="ml-10 flex items-center space-x-4">
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/complaints">Complaints</NavLink>
                  <NavLink to="/discussions">Discussions</NavLink>
                  {(user?.role === "mla" || user?.role === "district" || user?.role === "central") && (
                    <NavLink to="/dashboard">Dashboard</NavLink>
                  )}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => navigate("/notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/discussions")}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-socialize-blue-50"
                      >
                        <User className="h-5 w-5 text-socialize-blue-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{user?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                          <span className="text-xs font-medium text-socialize-blue-600 capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  {location.pathname !== "/login" && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/login")}
                      className="text-socialize-blue-600"
                    >
                      Login
                    </Button>
                  )}
                  {location.pathname !== "/register" && (
                    <Button
                      onClick={() => navigate("/register")}
                      className="bg-socialize-blue-600 hover:bg-socialize-blue-700"
                    >
                      Register
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 bg-gray-50">
        <div className="socialize-container">{children}</div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="socialize-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                © 2023 Socialize - Connecting MLAs with Voters
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-500 hover:text-socialize-blue-600 text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-socialize-blue-600 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-socialize-blue-600 text-sm"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
