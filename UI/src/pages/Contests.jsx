// import { useState, useEffect, useContext } from "react";
// import Navbar from "@/components/Navbar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { Calendar, Search, Trophy, Users, Award, Clock, Target, Tag } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import instance from "@/axios/axios";
// import { AuthContext } from "@/contexts/AuthContext";
// const Contests = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [newContest, setNewContest] = useState({
//     title: "",
//     description: "",
//     type: "free",
//     deadline: "",
//     prize: "",
//     duration: "",
//     difficulty: "medium",
//     requirements: "",
//     rules: "",
//     tags: []
//   });
//   const { toast } = useToast();
//   const { isAuthenticated } = useContext(AuthContext);

//   const [contests, setContests] = useState([]);

//   useEffect(() => {
//     const fetchContests = async () => {
//       try {
//         const res = await instance.get('/contest/contests/');
//         setContests(res.data);
//       } catch (err) {
//         console.error(err);
//         toast({ title: 'Error', description: 'Unable to load contests', variant: 'destructive' });
//       }
//     };
//     fetchContests();
//   }, []);

//   const handleCreateContest = async () => {
//     if (!isAuthenticated) {
//       toast({ title: 'Sign in required', description: 'Please login to create contests.', variant: 'destructive' });
//       return;
//     }
    
//     try {
//       const res = await instance.post('/contest/contests/', newContest);
//       setContests([res.data, ...contests]);
//       setIsCreateDialogOpen(false);
//       setNewContest({
//         title: "",
//         description: "",
//         type: "free",
//         deadline: "",
//         prize: "",
//         duration: "",
//         difficulty: "medium",
//         requirements: "",
//         rules: "",
//         tags: []
//       });
//       toast({ title: 'Success', description: 'Contest created successfully!' });
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.message || 'Unable to create contest';
//       toast({ title: 'Error', description: msg, variant: 'destructive' });
//     }
//   };

//   const handleParticipate = async (contest) => {
//     if (!isAuthenticated) {
//       toast({ title: 'Sign in required', description: 'Please login to join contests.', variant: 'destructive' });
//       return;
//     }
//     try {
//       const res = await instance.post(`/contest/contests/${contest.id}/join/`);
//       toast({ title: 'Joined', description: res.data.message || `Joined ${contest.title}` });
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.message || 'Unable to join contest';
//       toast({ title: 'Error', description: msg, variant: 'destructive' });
//     }
//   };

//   const filteredContests = contests.filter((contest) => {
//     const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       contest.description.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesFilter = filter === "all" || contest.status === filter;
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-subtle">
//       <Navbar />
      
//       <div className="container py-8">
//         <div className="space-y-6">
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div className="space-y-2">
//               <h1 className="text-4xl font-bold">Contests</h1>
//               <p className="text-muted-foreground">
//                 Participate in exciting challenges and showcase your skills
//               </p>
//             </div>
//             {isAuthenticated && (
//               <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
//                     Create Contest
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[700px]">
//                   <DialogHeader>
//                     <DialogTitle>Create New Contest</DialogTitle>
//                     <DialogDescription>
//                       Fill in the details for your new contest.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="title">Title</Label>
//                       <Input
//                         id="title"
//                         value={newContest.title}
//                         onChange={(e) => setNewContest({...newContest, title: e.target.value})}
//                         placeholder="Contest title"
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="description">Description</Label>
//                       <Textarea
//                         id="description"
//                         value={newContest.description}
//                         onChange={(e) => setNewContest({...newContest, description: e.target.value})}
//                         placeholder="Contest description"
//                         rows={3}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="grid gap-2">
//                         <Label htmlFor="type">Type</Label>
//                         <select
//                           id="type"
//                           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//                           value={newContest.type}
//                           onChange={(e) => setNewContest({...newContest, type: e.target.value})}
//                         >
//                           <option value="free">Free</option>
//                           <option value="paid">Paid</option>
//                         </select>
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="difficulty">Difficulty</Label>
//                         <select
//                           id="difficulty"
//                           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//                           value={newContest.difficulty}
//                           onChange={(e) => setNewContest({...newContest, difficulty: e.target.value})}
//                         >
//                           <option value="easy">Easy</option>
//                           <option value="medium">Medium</option>
//                           <option value="hard">Hard</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="grid gap-2">
//                         <Label htmlFor="deadline">Deadline</Label>
//                         <Input
//                           id="deadline"
//                           type="datetime-local"
//                           value={newContest.deadline}
//                           onChange={(e) => setNewContest({...newContest, deadline: e.target.value})}
//                         />
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="duration">Duration</Label>
//                         <Input
//                           id="duration"
//                           value={newContest.duration}
//                           onChange={(e) => setNewContest({...newContest, duration: e.target.value})}
//                           placeholder="e.g. 2 hours"
//                         />
//                       </div>
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="prize">Prize</Label>
//                       <Input
//                         id="prize"
//                         value={newContest.prize}
//                         onChange={(e) => setNewContest({...newContest, prize: e.target.value})}
//                         placeholder="Contest prize"
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="tags">Tags (comma-separated)</Label>
//                       <Input
//                         id="tags"
//                         value={newContest.tags.join(", ")}
//                         onChange={(e) => setNewContest({...newContest, tags: e.target.value.split(",").map(tag => tag.trim())})}
//                         placeholder="e.g. Python, Machine Learning, Data Science"
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="requirements">Requirements</Label>
//                       <Textarea
//                         id="requirements"
//                         value={newContest.requirements}
//                         onChange={(e) => setNewContest({...newContest, requirements: e.target.value})}
//                         placeholder="Contest requirements"
//                         rows={3}
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="rules">Rules</Label>
//                       <Textarea
//                         id="rules"
//                         value={newContest.rules}
//                         onChange={(e) => setNewContest({...newContest, rules: e.target.value})}
//                         placeholder="Contest rules"
//                         rows={3}
//                       />
//                     </div>
//                   </div>
//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button onClick={handleCreateContest} className="bg-gradient-primary hover:opacity-90">
//                       Create Contest
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>

//           {/* Search and Filter */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search contests..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Tabs value={filter} onValueChange={setFilter}>
//               <TabsList>
//                 <TabsTrigger value="all">All</TabsTrigger>
//                 <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//                 <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
//                 <TabsTrigger value="past">Past</TabsTrigger>
//               </TabsList>
//             </Tabs>
//           </div>

//           {/* Contests Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredContests.map((contest) => (
//               <Card key={contest.id} className="shadow-md hover:shadow-xl transition-all animate-fade-in">
//                 <CardHeader>
//                   <div className="flex items-start justify-between gap-4 flex-wrap">
//                     <div className="flex-1 space-y-2">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <CardTitle className="text-xl">{contest.title}</CardTitle>
//                         <Badge variant={contest.type === "free" ? "default" : "secondary"}>
//                           {contest.type === "free" ? "Free" : "Paid"}
//                         </Badge>
//                         <Badge variant={
//                           contest.status === "ongoing" ? "default" :
//                           contest.status === "upcoming" ? "secondary" : "outline"
//                         }>
//                           {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
//                         </Badge>
//                       </div>
//                       <CardDescription>{contest.description}</CardDescription>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4" />
//                       <span>{new Date(contest.deadline).toLocaleDateString()}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users className="h-4 w-4" />
//                       <span>{contest.participants} participants</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Award className="h-4 w-4" />
//                       <span>{contest.prize}</span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 flex-wrap">
//                     {contest.tags.slice(0, 3).map((tag, index) => (
//                       <Badge key={index} variant="outline" className="text-xs">
//                         {tag}
//                       </Badge>
//                     ))}
//                   </div>
//                 </CardContent>
//                 <CardFooter className="flex gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="outline" className="flex-1">
//                         View Details
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
//                       <DialogHeader>
//                         <DialogTitle className="text-2xl">{contest.title}</DialogTitle>
//                         <DialogDescription>{contest.description}</DialogDescription>
//                       </DialogHeader>
                      
//                       <div className="space-y-6 py-4">
//                         <div className="flex gap-2 flex-wrap">
//                           <Badge variant={contest.type === "free" ? "default" : "secondary"}>
//                             {contest.type === "free" ? "Free Entry" : "Paid Entry"}
//                           </Badge>
//                           <Badge variant={
//                             contest.status === "ongoing" ? "default" :
//                             contest.status === "upcoming" ? "secondary" : "outline"
//                           }>
//                             {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
//                           </Badge>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Award className="h-5 w-5" />
//                               <span className="text-sm font-medium">Prize</span>
//                             </div>
//                             <p className="text-lg font-semibold">{contest.prize}</p>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Clock className="h-5 w-5" />
//                               <span className="text-sm font-medium">Duration</span>
//                             </div>
//                             <p className="text-lg font-semibold">{contest.duration}</p>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Target className="h-5 w-5" />
//                               <span className="text-sm font-medium">Difficulty</span>
//                             </div>
//                             <p className="text-lg font-semibold">{contest.difficulty}</p>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Calendar className="h-5 w-5" />
//                               <span className="text-sm font-medium">Deadline</span>
//                             </div>
//                             <p className="text-lg font-semibold">{new Date(contest.deadline).toLocaleDateString()}</p>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Users className="h-5 w-5" />
//                               <span className="text-sm font-medium">Participants</span>
//                             </div>
//                             <p className="text-lg font-semibold">{contest.participants}</p>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Trophy className="h-5 w-5" />
//                               <span className="text-sm font-medium">Organizer</span>
//                             </div>
//                             <p className="text-lg font-semibold">{contest.organizer}</p>
//                           </div>
//                         </div>

//                         <Separator />

//                         <div className="space-y-3">
//                           <h4 className="font-semibold flex items-center gap-2">
//                             <Tag className="h-4 w-4" />
//                             Technologies & Skills
//                           </h4>
//                           <div className="flex gap-2 flex-wrap">
//                             {contest.tags.map((tag, index) => (
//                               <Badge key={index} variant="secondary">
//                                 {tag}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>

//                         <Separator />

//                         <div className="space-y-3">
//                           <h4 className="font-semibold">Requirements</h4>
//                           <p className="text-muted-foreground">{contest.requirements}</p>
//                         </div>

//                         <Separator />

//                         <div className="space-y-3">
//                           <h4 className="font-semibold">Rules & Guidelines</h4>
//                           <p className="text-muted-foreground">{contest.rules}</p>
//                         </div>

//                         <Button 
//                           className="w-full bg-gradient-primary hover:opacity-90 shadow-glow" 
//                           onClick={() => handleParticipate(contest)}
//                           size="lg"
//                         >
//                           <Trophy className="h-5 w-5 mr-2" />
//                           Participate Now
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
                  
//                   <Button 
//                     className="flex-1 bg-gradient-primary hover:opacity-90 shadow-glow" 
//                     onClick={() => handleParticipate(contest)}
//                   >
//                     <Trophy className="h-4 w-4 mr-2" />
//                     Participate
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>

//           {filteredContests.length === 0 && (
//             <div className="text-center py-12">
//               <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
//               <h3 className="text-xl font-semibold mb-2">No contests found</h3>
//               <p className="text-muted-foreground">Try adjusting your search or filter</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contests;

import React from "react";
import Navbar from "@/components/Navbar";
import { Trophy } from "lucide-react";

const Contests = () => {
  return (
    <div >
      <Navbar />
      <div className="text-center space-y-6 py-20">
        <Trophy className="h-20 w-20 mx-auto text-muted-foreground animate-pulse" />
        <h1 className="text-5xl font-bold">Contests</h1>
        <p className="text-lg text-muted-foreground">🚀 Coming Soon — Stay tuned for exciting challenges!</p>
      </div>
    </div>
  );
};

export default Contests;
