import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ThumbsUp,
  ThumbsDown,
  Plus,
  Search,
  Eye,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import instance from "@/axios/axios";
import { AuthContext } from "@/contexts/AuthContext";

const Forum = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postButton, setPostButton] = useState("Create Post");
  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await instance.get("/forum/forum/");
        const data = res.data.map((p) => ({
          id: p.id,
          author: p.author_username || "Unknown",
          title: p.title,
          content: p.content,
          date: p.created_at,
          likes: p.likes || 0,
          dislikes: p.dislikes || 0,
          mediaUrl: p.media_link || null,
          comment_count: p.comment_count || 0,
        }));
        setPosts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setPostButton("Creating...");
    try {
      let media_link = null;

      if (newPostMedia) {
        const cloudName = "dmhjf0t58";
        const uploadPreset = "cts-campusehub";
        const formData = new FormData();
        formData.append("file", newPostMedia);
        formData.append("upload_preset", uploadPreset);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await uploadRes.json();
        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        media_link = data.secure_url;
      }

      const res = await instance.post("/forum/forum/", {
        title: newPostTitle,
        content: newPostContent,
        media_link,
      });

      const p = res.data;
      setPosts([
        {
          id: p.id,
          author: p.author_username || "You",
          title: p.title,
          content: p.content,
          date: p.created_at,
          likes: 0,
          dislikes: 0,
          mediaUrl: p.media_link || null,
          comment_count: 0,
        },
        ...posts,
      ]);

      toast({
        title: "Post created!",
        description: "Your post has been published to the forum.",
      });
      setPostButton("Create Post");
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostMedia(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Upload/Create Post Error:", err);
      setPostButton("Create Post");
      toast({
        title: "Error",
        description: "Unable to create post",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await instance.post(`/forum/forum/${postId}/like/`);
      setPosts(posts.map((post) =>
        post.id === postId ? { ...post, likes: res.data.likes, dislikes: res.data.dislikes } : post
      ));
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to like post",
        variant: "destructive",
      });
    }
  };

  const handleDislike = async (postId) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please login to dislike posts",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await instance.post(`/forum/forum/${postId}/dislike/`);
      setPosts(posts.map((post) =>
        post.id === postId ? { ...post, likes: res.data.likes, dislikes: res.data.dislikes } : post
      ));
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to dislike post",
        variant: "destructive",
      });
    }
  };

  // 🌐 Share post
  const handleShare = async (post) => {
    const postUrl = `${window.location.origin}/forum/${post.id}`;
    const shareData = {
      title: post.title,
      text: post.content.slice(0, 100) + "...",
      url: postUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Shared!", description: "Post shared successfully." });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied!", description: "Post link copied to clipboard." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Unable to share post.", variant: "destructive" });
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <Navbar />
      <div className="container py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Campus Forum
            </h1>
            <p className="text-muted-foreground">Share ideas, discuss topics, and collaborate!</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>Share your thoughts with everyone</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label>Title</Label>
                <Input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Enter post title" />
                <Label>Content</Label>
                <Textarea rows={5} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Write something..." />
                <Label>Media (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*,video/*" onChange={(e) => setNewPostMedia(e.target.files?.[0] || null)} />
                  <ImageIcon className="text-gray-500" />
                </div>
                <Button onClick={handleCreatePost} disabled={postButton === "Creating..."} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {postButton}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length === 0 && (
            <p className="text-center col-span-full text-gray-500">No posts found.</p>
          )}
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="shadow-md hover:shadow-lg transition-all border border-gray-200 rounded-2xl overflow-hidden"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{post.author[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                    <CardDescription>
                      {post.author} • {new Date(post.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3" onClick={() => navigate(`/forum/${post.id}`)}>{post.content}</p>

                {post.mediaUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden aspect-video">
                    <img
                      src={post.mediaUrl}
                      alt="media"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t mt-4">
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className="gap-1">
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDislike(post.id)} className="gap-1">
                      <ThumbsDown className="h-4 w-4" /> {post.dislikes}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post)}
                      className="gap-1 text-green-600 hover:text-green-800"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/forum/${post.id}`)}
                      className="gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;
