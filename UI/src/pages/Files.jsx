import { useContext } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FileManager from "@/components/FileManager";
import { AuthContext } from "@/contexts/AuthContext";

const Files = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // If not logged in → show message instead of file manager
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center space-y-4 mt-20">
          <h1 className="text-3xl font-bold text-gray-800">Access Restricted</h1>
          <p className="text-muted-foreground text-lg">
            You must be logged in to view your files.
          </p>
          <a
            href="/login"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Normal page when logged in
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container py-8">
        <div className="space-y-6">
          {/* Storage Info */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Google Drive Storage</span>
                  <span className="text-muted-foreground">Calculating...</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* File Manager */}
          <div className="bg-white rounded-lg shadow-md">
            <FileManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
