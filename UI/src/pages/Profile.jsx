import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Award, Edit } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext, useState, useEffect } from "react";
import instance from "@/axios/axios";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',

  });

  // Fetch full profile data including contests and achievements
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get('/user/profile/');
        // Update auth context with fresh data
        setUser((prev) => ({ ...prev, profile: res.data }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleUpdateProfile = async () => {
    try {
      const res = await instance.put('/user/update-profile/', editData);
      setUser((prev) => ({ ...prev, ...editData, profile: res.data }));
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ 
        title: 'Update failed', 
        description: err?.response?.data?.message || 'Unable to update profile',
        variant: 'destructive'
      });
    }
  };

  const contests = [
    { id: 1, name: "Web Development Challenge", status: "Completed", rank: "Top 10%", date: "2025-09-15" },
    { id: 2, name: "AI/ML Competition", status: "Ongoing", rank: "-", date: "2025-10-20" },
    { id: 3, name: "Design Sprint", status: "Completed", rank: "Top 5%", date: "2025-08-10" },
    { id: 4, name: "Blockchain Innovation", status: "Registered", rank: "-", date: "2025-11-25" },
  ];

  const achievements = [
    { id: 1, title: "First Contest", description: "Participated in first contest", icon: Trophy },
    { id: 2, title: "Top Performer", description: "Ranked in top 10% in a contest", icon: Award },
    { id: 3, title: "Active Member", description: "Posted 10 times in forum", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar || "../../public/male.png"} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                    {user.username}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-3xl font-bold">{user.username}</h1>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>Update your profile information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                              placeholder="Username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              placeholder="Email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea
                              value={editData.bio}
                              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                              placeholder="Tell us about yourself"
                              rows={4}
                            />
                          </div>
                          <Button onClick={handleUpdateProfile} className="w-full">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-muted-foreground">{user.profile.bio}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements 
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Achievements</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <Card key={achievement.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contest Participation 
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contest Participation</h2>
            <div className="grid gap-4">
              {contests.map((contest) => (
                <Card key={contest.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{contest.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contest.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={
                          contest.status === "Completed" ? "default" : 
                          contest.status === "Ongoing" ? "secondary" : 
                          "outline"
                        }>
                          {contest.status}
                        </Badge>
                        {contest.rank !== "-" && (
                          <Badge className="bg-accent">{contest.rank}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
*/}
          {/* Stats 
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">4</div>
                <div className="text-sm text-muted-foreground">Contests Joined</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">2</div>
                <div className="text-sm text-muted-foreground">Contests Won</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">Forum Posts</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">42</div>
                <div className="text-sm text-muted-foreground">Files Shared</div>
              </CardContent>
            </Card>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default Profile;
