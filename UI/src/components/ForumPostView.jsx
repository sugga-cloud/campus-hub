import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, ThumbsDown, Send, X, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForumPostView({ 
  post, 
  onClose, 
  onLike, 
  onDislike, 
  onAddComment, 
  isAuthenticated,
  onLoadComments,
}) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []); // ✅ Local copy
  const { toast } = useToast();

  // ✅ Keep comments synced if post changes (e.g. new post is opened)
  useEffect(() => {
    setComments(post.comments || []);
  }, [post]);

  // ✅ Handle adding new comment with immediate update
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(), // temporary local id
      author: "You",
      content: commentText.trim(),
      date: new Date().toISOString(),
    };

    // Update local comments instantly
    setComments((prev) => [newComment, ...prev]);
    setCommentText("");

    try {
      await onAddComment(commentText); // still call backend
      toast({ title: "Comment added", description: "Your comment was posted successfully." });
    } catch (err) {
      // rollback if failed
      setComments((prev) => prev.filter((c) => c.id !== newComment.id));
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container flex h-full py-4">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl mx-auto relative overflow-y-auto">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Back button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-10 md:hidden"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="p-6 space-y-6">
            {/* Post header */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{post.title}</h3>
                  <p className="text-muted-foreground">
                    Posted by {post.author} on {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Post content */}
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg">{post.content}</p>
              </div>

              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.mediaUrl} 
                    alt="Post media" 
                    className="w-full h-auto max-h-[500px] object-contain bg-muted"
                  />
                </div>
              )}

              {/* Interaction buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={onLike}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={onDislike}
                >
                  <ThumbsDown className="h-4 w-4" />
                  {post.dislikes}
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {comments.length} Comments
                </div>
              </div>
            </div>

            <Separator />

            {/* Comments section */}
            <div className="space-y-6">
              <h4 className="font-semibold text-xl">Comments</h4>
              
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              )}

              {/* Comment input */}
              <div className="sticky bottom-0 pt-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={!isAuthenticated}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!isAuthenticated || !commentText.trim()}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
