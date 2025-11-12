import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, MessageSquare, FolderOpen, User, LogOut, Moon, Sun, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, setIsAuthenticated, logout } = useContext(AuthContext);
  const [navItems,setNavItems] = useState([]);
  useEffect(() => {
    if(isAuthenticated)
    setNavItems([
      { path: "/", icon: Home, label: "Home" },
      { path: "/contests", icon: Trophy, label: "Contests" },
      { path: "/forum", icon: MessageSquare, label: "Forum" },
      { path: "/files", icon: FolderOpen, label: "Files" },
      { path: "/courses", icon: BookOpen, label: "Courses" },
      { path: "/profile", icon: User, label: "Profile" },
    ]);
    else
    setNavItems([
      { path: "/", icon: Home, label: "Home" },
      { path: "/contests", icon: Trophy, label: "Contests" },
      { path: "/forum", icon: MessageSquare, label: "Forum" },
      { path: "/courses", icon: BookOpen, label: "Courses" },
      { path: "/login", icon: User, label: "Login" },
      { path: "/register", icon: User, label: "Register" },
    ]);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
    // Redirect logic would go here
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CampusHub
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div className="container flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
