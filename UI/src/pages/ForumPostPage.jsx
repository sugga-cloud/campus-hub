import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import ForumPostView from "@/components/ForumPostView";
import instance from "@/axios/axios";
import { AuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Share2, ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";

export default function ForumPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [updatingReaction, setUpdatingReaction] = useState(false);

  // ✅ Fetch single post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await instance.get(`/forum/forum/${postId}/`);
        setPost({
          id: res.data.id,
          author: res.data.author_username || "Unknown",
          title: res.data.title,
          content: res.data.content,
          date: new Date(res.data.created_at).toLocaleString(),
          likes: res.data.likes || 0,
          dislikes: res.data.dislikes || 0,
          mediaUrl: res.data.media_link || null,
          comments: [],
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to load post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // ✅ Fetch comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await instance.get(`/forum/forum/${postId}/comments/`);
      const comments = res.data.map((c) => ({
        id: c.id,
        author: c.author_username || c.author,
        content: c.content,
        date: new Date(c.created_at).toLocaleString(),
      }));
      setPost((prev) => ({ ...prev, comments }));
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  // ✅ Like Post
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }
    try {
      setUpdatingReaction(true);
      const res = await instance.post(`/forum/forum/${postId}/like/`);
      setPost((prev) => ({
        ...prev,
        likes: res.data.likes,
        dislikes: res.data.dislikes,
      }));
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to like post",
        variant: "destructive",
      });
    } finally {
      setUpdatingReaction(false);
    }
  };

  // ✅ Dislike Post
  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please login to dislike posts",
        variant: "destructive",
      });
      return;
    }
    try {
      setUpdatingReaction(true);
      const res = await instance.post(`/forum/forum/${postId}/dislike/`);
      setPost((prev) => ({
        ...prev,
        likes: res.data.likes,
        dislikes: res.data.dislikes,
      }));
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to dislike post",
        variant: "destructive",
      });
    } finally {
      setUpdatingReaction(false);
    }
  };

  // ✅ Share Post
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/forum/${postId}`;
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: "Check out this post on Campus Forum!",
          url: shareUrl,
        });
        toast({ title: "Shared!", description: "Post shared successfully." });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Unable to share post.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  if (!post)
    return (
      <p className="text-center text-gray-600 mt-10">
        Post not found or has been deleted.
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 flex justify-center">
      <Card className="w-full max-w-3xl shadow-lg rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b rounded-t-2xl bg-gray-100">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/forum")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {post.title}
            </h1>
          </div>

          <Button
            onClick={handleShare}
            size="sm"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        {/* Post Content */}
        <CardContent className="p-6 space-y-6">
          <ForumPostView
            post={post}
            onClose={() => navigate("/forum")}
            onLike={handleLike}
            onDislike={handleDislike}
            onAddComment={() => {}}
            isAuthenticated={isAuthenticated}
            onLoadComments={loadComments}
          />

          {/* Like & Dislike Buttons (Visible Always) */}
          <div className="flex justify-center gap-6 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={updatingReaction}
              onClick={handleLike}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <ThumbsUp className="w-4 h-4" />
              {post.likes}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={updatingReaction}
              onClick={handleDislike}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <ThumbsDown className="w-4 h-4" />
              {post.dislikes}
            </Button>
          </div>

          {loadingComments && (
            <div className="flex justify-center mt-4">
              <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
              <span className="ml-2 text-gray-500 text-sm">
                Loading comments...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
