import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { driveService } from '@/services/driveService';
import FileGrid from './FileGrid';
import { Progress } from '@/components/ui/progress';

export default function FileManager() {
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [fileCache, setFileCache] = useState({});
    const fileCacheRef = useRef(fileCache);
    const [currentPath, setCurrentPath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newFolderDialog, setNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const [renamingFileId, setRenamingFileId] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const status = searchParams.get('status');
        if (status === 'success') {
            toast({
                title: "Connected!",
                description: "Successfully connected to Google Drive",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [toast]);

    useEffect(() => {
        fileCacheRef.current = fileCache;
    }, [fileCache]);

    const loadFiles = useCallback(async () => {
        const key = currentFolder?.id || 'root';
        try {
            setLoading(true);
            const response = await driveService.listFiles(currentFolder?.id);

            if (response.files && Array.isArray(response.files)) {
                setFiles(response.files);
                setFileCache(prev => {
                    const next = { ...prev, [key]: response.files };
                    fileCacheRef.current = next;
                    return next;
                });
            } else {
                toast({
                    title: "Error",
                    description: "Invalid response format from server",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error loading files:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to load files",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [currentFolder, toast]);

    useEffect(() => {
        loadFiles();
    }, [currentFolder]);

    // 👇 Upload with random progress simulation
    const onDrop = useCallback(async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

            let simulatedProgress = 0;
            const fakeProgressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const current = prev[file.name] || 0;
                    const increment = Math.random() * 7 + 3;
                    simulatedProgress = Math.min(current + increment, 95);
                    return { ...prev, [file.name]: simulatedProgress };
                });
            }, 200);

            try {
                await driveService.uploadFile(
                    file,
                    currentFolder?.id,
                    (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(prev => ({
                                ...prev,
                                [file.name]: Math.min(percent, 95),
                            }));
                        }
                    }
                );

                clearInterval(fakeProgressInterval);
                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                toast({ title: "Success", description: `Uploaded ${file.name}` });

                setTimeout(() => {
                    setUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[file.name];
                        return newProgress;
                    });
                }, 1500);

                loadFiles();
            } catch (error) {
                clearInterval(fakeProgressInterval);
                toast({
                    title: "Error",
                    description: `Failed to upload ${file.name}`,
                    variant: "destructive"
                });
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[file.name];
                    return newProgress;
                });
            }
        }
    }, [currentFolder, loadFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // 👇 Folder creation with random progress simulation
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        const name = newFolderName.trim();
        setUploadProgress(prev => ({ ...prev, [name]: 0 }));
        setNewFolderDialog(false);
        setNewFolderName('');

        let simulatedProgress = 0;
        const fakeProgressInterval = setInterval(() => {
            setUploadProgress(prev => {
                const current = prev[name] || 0;
                const increment = Math.random() * 10 + 5;
                simulatedProgress = Math.min(current + increment, 95);
                return { ...prev, [name]: simulatedProgress };
            });
        }, 250);

        try {
            await new Promise(res => setTimeout(res, 1500)); // just to simulate some delay
            await driveService.createFolder(name, currentFolder?.id);

            clearInterval(fakeProgressInterval);
            setUploadProgress(prev => ({ ...prev, [name]: 100 }));

            toast({
                title: "Success",
                description: "Folder created successfully",
            });

            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[name];
                    return newProgress;
                });
            }, 1200);

            loadFiles();
        } catch (error) {
            clearInterval(fakeProgressInterval);
            toast({
                title: "Error",
                description: "Failed to create folder",
                variant: "destructive"
            });
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[name];
                return newProgress;
            });
        }
    };

    const handleConnectDrive = async () => {
        try {
            await driveService.initiateGoogleAuth();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to connect to Google Drive",
                variant: "destructive"
            });
        }
    };

    const handleRename = async (fileId, newName) => {
        if (!newName.trim()) return;
        setRenamingFileId(fileId);
        try {
            await driveService.renameFile(fileId, newName);
            toast({ title: "Renamed", description: "File renamed successfully" });
            await loadFiles();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to rename file",
                variant: "destructive"
            });
        } finally {
            setRenamingFileId(null);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">File Manager</h1>
                <div className="space-x-2">
                    <Button onClick={() => setNewFolderDialog(true)}>New Folder</Button>
                    <Button onClick={handleConnectDrive}>Connect Google Drive</Button>
                </div>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
                    isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} />
                <p>Drag & drop files here, or click to select files</p>
            </div>

            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-3 mb-6">
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="truncate max-w-[60%]">{name}</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    ))}
                </div>
            )}

            <FileGrid
                files={files}
                loading={loading}
                onFolderClick={(folder) => {
                    // folder === null means go to root
                    if (!folder) {
                        setCurrentFolder(null);
                        setCurrentPath([]);
                        return;
                    }

                    // update path safely using functional updater
                    setCurrentPath(prev => {
                        const idx = prev.findIndex(p => p.id === folder.id);
                        if (idx !== -1) {
                            // clicked an ancestor in breadcrumb -> trim
                            setCurrentFolder(folder);
                            return prev.slice(0, idx + 1);
                        }
                        // clicked a child folder in grid -> push
                        setCurrentFolder(folder);
                        return [...prev, folder];
                    });
                }}
                onRefresh={loadFiles}
                onRename={handleRename}
                renamingFileId={renamingFileId}
                currentPath={currentPath}
            />

            <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateFolder}>Create</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
