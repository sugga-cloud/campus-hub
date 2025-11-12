import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { 
    Loader2, 
    MoreVertical, 
    Folder, 
    FileText, 
    Image, 
    Video,
    Music,
    FileCode,
    Archive,
    Film,
    File,
    Download,
    ChevronRight
} from 'lucide-react';
import { driveService } from '@/services/driveService';
import { useToast } from '@/hooks/use-toast';
import instance from '../axios/axios';
const getFileIcon = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') return Folder;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('text/')) return FileText;
    if (mimeType.includes('code') || mimeType.includes('script')) return FileCode;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return Archive;
    if (mimeType.includes('presentation')) return Film;
    return File;
};

const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseInt(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export default function FileGrid({ files, loading, onFolderClick, onRefresh, currentPath = [] }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [renameDialog, setRenameDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [renaming, setRenaming] = useState(false);
    const { toast } = useToast();

    const handleRename = async () => {
        if (!newName.trim() || !selectedFile) return;
        setRenaming(true);
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
                variant: "destructive",
            });
        } finally {
            setRenaming(false);
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
                variant: "destructive",
            });
        }
    };

    const doDownload = async (file) => {
        try {
            const response = await driveService.downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({
                title: "Download started",
                description: `${file.name} is downloading`,
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: "Error",
                description: "Failed to download file",
                variant: "destructive",
            });
        }
    };
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


    const handleDownload = (file, delaySeconds = 3) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') return;
        toast({
            title: 'Download queued',
            description: `${file.name} will be downloaded in ${delaySeconds} seconds`,
        });
        setTimeout(() => {
            doDownload(file);
        }, delaySeconds * 1000);
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
            {/* 🔹 Breadcrumb Header */}
            <div className="flex items-center space-x-1 mb-4 text-sm text-muted-foreground">
                <span
                    className="cursor-pointer hover:text-primary"
                    onClick={() => onFolderClick(null)} // go to root
                >
                    Root
                </span>
                {currentPath.map((folder, idx) => (
                    <React.Fragment key={folder.id}>
                        <ChevronRight className="w-4 h-4 mx-1" />
                        <span
                            className={`cursor-pointer hover:text-primary ${
                                idx === currentPath.length - 1 ? 'text-foreground font-medium' : ''
                            }`}
                            onClick={() => onFolderClick(folder)}
                        >
                            {folder.name}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            {/* 🔹 File Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => {
                    const IconComponent = getFileIcon(file.mimeType);
                    return (
                        <Card 
                            key={file.id}
                            className="group relative hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-4">
                                <div 
                                    className={`flex flex-col items-center space-y-2 cursor-pointer ${
                                        selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
                                    }`}
                                    onClick={() => {
                                        if (file.mimeType === 'application/vnd.google-apps.folder') {
                                            onFolderClick(file);
                                        } else {
                                            setSelectedFile(file);
                                        }
                                    }}
                                    onDoubleClick={() => {
                                        if (file.mimeType === 'application/vnd.google-apps.folder') {
                                            onFolderClick(file);
                                        } else {
                                            handleDownload(file);
                                        }
                                    }}
                                >
                                    <IconComponent className="h-12 w-12" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-medium truncate max-w-[150px]">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {file.mimeType !== 'application/vnd.google-apps.folder' && (
                                                <DropdownMenuItem onClick={() => handleDownload(file)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </DropdownMenuItem>
                                            )}
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
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 🔹 Rename Dialog */}
            <Dialog open={renameDialog} onOpenChange={setRenameDialog}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Rename Item</h2>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New name"
                        className="mb-4"
                        disabled={renaming}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setRenameDialog(false)}
                            disabled={renaming}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleRename} disabled={renaming}>
                            {renaming ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Renaming...
                                </>
                            ) : (
                                'Rename'
                            )}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
