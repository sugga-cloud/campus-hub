import React, { useState, useEffect, useContext } from 'react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search, Play, List, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import instance from "@/axios/axios";
import { AuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newCourseDialog, setNewCourseDialog] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        youtube_url: "",
        content_type: "video",
        tags: ""
    });

    const { toast } = useToast();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await instance.get('/course/courses/');
            const data = (() => {
            const arr = [...res.data];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
            })();
            setCourses(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load courses",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!formData.title || !formData.youtube_url) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            await instance.post('/course/courses/', formData);
            toast({
                title: "Success",
                description: "Course added successfully"
            });
            setNewCourseDialog(false);
            setFormData({
                title: "",
                description: "",
                youtube_url: "",
                content_type: "video",
                tags: ""
            });
            fetchCourses();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add course",
                variant: "destructive"
            });
        }
    };

    const filteredCourses = courses.filter(
        course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tags.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />
            
            <div className="container py-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold">Courses</h1>
                            <p className="text-muted-foreground">
                                Discover and share educational content from YouTube
                            </p>
                        </div>
                        <Dialog open={newCourseDialog} onOpenChange={setNewCourseDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Course</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter course title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter course description..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="youtube_url">YouTube URL</Label>
                                        <Input
                                            id="youtube_url"
                                            placeholder="Enter YouTube video or playlist URL"
                                            value={formData.youtube_url}
                                            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content_type">Content Type</Label>
                                        <Select
                                            value={formData.content_type}
                                            onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="video">Single Video</SelectItem>
                                                <SelectItem value="playlist">Playlist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input
                                            id="tags"
                                            placeholder="Enter tags (comma-separated)"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                    </div>

                                    <Button onClick={handleCreateCourse} className="w-full bg-gradient-primary hover:opacity-90">
                                        Add Course
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Course Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCourses.map((course) => (
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
                                                <Button variant="ghost" className="text-white gap-2">
                                                    {course.content_type === 'playlist' ? (
                                                        <List className="h-6 w-6" />
                                                    ) : (
                                                        <Play className="h-6 w-6" />
                                                    )}
                                                    Watch {course.content_type === 'playlist' ? 'Playlist' : 'Video'}
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                    <CardHeader className="space-y-2">
                                        <div className="space-y-1">
                                            <CardTitle className="line-clamp-2">
                                                {course.title}
                                            </CardTitle>
                                            <CardDescription>
                                                Added by {course.author_username}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {course.description}
                                        </p>
                                        {course.tags && (
                                            <div className="flex flex-wrap gap-2">
                                                {course.tags.split(',').map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                                                    >
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!loading && filteredCourses.length === 0 && (
                        <div className="text-center py-12">
                            <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground">Try adjusting your search or add a new course</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}