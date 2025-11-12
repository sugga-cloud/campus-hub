import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contests from "./pages/Contests";
import Forum from "./pages/Forum";
import Files from "./pages/Files";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import NotFound from "./pages/NotFound";
import ForumPostPage from "./pages/ForumPostPage"
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";
const queryClient = new QueryClient();

const App = () => (
  <AuthProvider> 
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              {/* Protected routes go here */}
              <Route path="/files" element={<Files />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/forum/:postId" element={<ForumPostPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/contests/:id" element={<Contests />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;
