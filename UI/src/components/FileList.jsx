import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, MoreVertical, Folder, File } from 'lucide-react';
import { driveService } from '@/services/driveService';
import { useToast } from '@/hooks/use-toast';
import instance from '../axios/axios';

export default function FileList({ files, loading, onFolderClick, onRefresh }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [renameDialog, setRenameDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const { toast } = useToast();
const setShare = async (file) => {
  try {
    const { data } = await instance.get(`/files/drive/${file.id}/shareable/`);

    if (data?.view_link) {
      // Copy to clipboard
      await navigator.clipboard.writeText(data.view_link);

      toast({
        title: "✅ Link Copied",
        description: `Shareable link for "${file.name}" has been copied to your clipboard.`,
      });
    } else {
      toast({
        title: "⚠️ No Link Returned",
        description: "Failed to retrieve shareable link. Please try again.",
        variant: "destructive",
      });
    }

    console.log("Share link response:", data);
  } catch (error) {
    console.error("Error sharing file:", error);
    toast({
      title: "❌ Error",
      description: "Failed to create or copy shareable link.",
      variant: "destructive",
    });
  }
};

    const handleRename = async () => {
        if (!newName.trim() || !selectedFile) return;
        
        try {
            await driveService.rename(selectedFile.id, newName);
            toast({
                title: "Success",
                description: "Item renamed successfully",
            });
            setRenameDialog(false);
            setNewName('');
            onRefresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to rename item",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (file) => {
        try {
            await driveService.delete(file.id);
            toast({
                title: "Success",
                description: "Item deleted successfully",
            });
            onRefresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete item",
                variant: "destructive"
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell className="flex items-center space-x-2">
                                {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                    <Folder className="h-4 w-4" />
                                ) : (
                                    <File className="h-4 w-4" />
                                )}
                                <span
                                    className={file.mimeType === 'application/vnd.google-apps.folder' ? 'cursor-pointer hover:underline' : ''}
                                    onClick={() =>
                                        file.mimeType === 'application/vnd.google-apps.folder' &&
                                        onFolderClick(file.id)
                                    }
                                >
                                    {file.name}
                                </span>
                            </TableCell>
                            <TableCell>{formatDate(file.modifiedTime)}</TableCell>
                            <TableCell>{file.size || '-'}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedFile(file);
                                                setNewName(file.name);
                                                setRenameDialog(true);
                                            }}
                                        >
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedFile(file);
                                                setShare(file);
                                            }}
                                        >
                                            Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => handleDelete(file)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Only render rename dialog when opened */}
            {renameDialog && (
                <Dialog open={renameDialog} onOpenChange={setRenameDialog}>
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">Rename Item</h2>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New name"
                            className="mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setRenameDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleRename}>Rename</Button>
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}
