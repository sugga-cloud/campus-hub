import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Trophy, 
  MessageSquare, 
  FolderOpen, 
  BookOpen,
  ThumbsUp,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import instance from "@/axios/axios";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
const Home = () => {
  const [stats, setStats] = useState({
    activeContests: 0,
    forumPosts: 0,
    filesShared: 0,
    courses: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [contests, setContests] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [
          contestsRes,
          forumRes,
          coursesRes,
          filesShared
        ] = await Promise.all([
          instance.get('/contest/contests/'),
          instance.get('/forum/forum/'),
          instance.get('/course/courses/'),
          instance.get('/files/drive/totalShared/'),
        ]);
        // Update stats
        setStats({
          activeContests: contestsRes.data.length,
          forumPosts: forumRes.data.length,
          filesShared:filesShared.data.total_shared_files, // You can add file count endpoint
          courses: coursesRes.data.length
        });

        // Sort contests by date
        const sortedContests = contestsRes.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setContests(sortedContests);

        // Sort forum posts by likes
        const sortedPosts = forumRes.data
          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
          .slice(0, 4);
        setForumPosts(sortedPosts);

        // Get latest courses
        const latestCourses = coursesRes.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setCourses(latestCourses);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load some content",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsItems = [
    { label: "Active Contests", value: stats.activeContests, icon: Trophy },
    { label: "Forum Posts", value: stats.forumPosts, icon: MessageSquare },
    { label: "Files Shared", value: stats.filesShared, icon: FolderOpen },
    { label: "Video Courses", value: stats.courses, icon: BookOpen },
  ];

  const dummyContests = [
    {
      id: 1,
      title: "Web Development Challenge",
      description: "Build a responsive web application using modern frameworks",
      type: "Free",
      deadline: "2025-11-15",
    },
    {
      id: 2,
      title: "AI/ML Competition",
      description: "Create innovative machine learning solutions",
      type: "Paid",
      deadline: "2025-11-20",
    },
    {
      id: 3,
      title: "Design Sprint",
      description: "Design the future of education technology",
      type: "Free",
      deadline: "2025-11-10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to CampusHub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one platform for contests, collaboration, and community
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contests">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                Explore Contests
              </Button>
            </Link>
            <Link to="/forum">
              <Button size="lg" variant="outline">
                Join Discussion
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-primary">
                    {loading ? "..." : stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="container pb-16 grid md:grid-cols-2 gap-8">
        {/* Latest Contests */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active Contests</h2>
            <Link to="/contests">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <Card className="h-[300px] flex items-center justify-center">
                <CardContent>Loading...</CardContent>
              </Card>
            ) : contests.length > 0 ? (
              contests.map((contest) => (
                <Card key={contest.id} className="shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {new Date(contest.deadline).toLocaleDateString()}
                      </span>
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{contest.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{contest.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/contests/${contest.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="h-[300px] flex items-center justify-center">
                <CardContent>No active contests</CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Popular Forum Posts */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Discussions</h2>
            <Link to="/forum">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ScrollArea className="h-[500px] rounded-lg border p-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : forumPosts.length > 0 ? (
              <div className="space-y-4">
                {forumPosts.map((post) => (
                  <Link to={"/forum/"+post.id}>
                  <Card key={post.id} className="shadow-sm hover:shadow transition">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{post.title}</CardTitle>
                            <CardDescription>by {post.author}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.comment_count}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No forum posts yet</div>
            )}
          </ScrollArea>
        </section>
      </div>

      {/* Latest Courses */}
      <section className="container pb-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Courses</h2>
            <Link to="/courses">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-[300px] flex items-center justify-center">
                  <CardContent>Loading...</CardContent>
                </Card>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative group">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={course.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white"
                      >
                        <Button variant="ghost" className="text-white">
                          Watch Now
                        </Button>
                      </a>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">No courses available</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
