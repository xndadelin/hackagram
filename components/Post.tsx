import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Plus, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetUser } from "@/utils/queries/getUser";
import { createClient } from "@/lib/supabase/client";

export function Post() {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [currentStep, setCurrentStep] = useState<'select' | 'caption'>('select');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data } = useGetUser();
    const [caption, setCaption] = useState('');
    const supabase = createClient();
    const [isUploading, setIsUploading] = useState(false);


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(droppedFiles);
            setCurrentStep('caption');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
            setCurrentStep('caption');
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleGoBack = () => {
        setCurrentStep('select');
    };

    const handleShare = async () => {
        if (files.length === 0) return;
        try {
            setIsUploading(true);
            const user_id = data?.user?.id;
            if (!user_id) {
                throw new Error("user not authenticated");
            }

            const uploadPromises = files.map(async (file, index) => {
                const fileExtension = file.name.split('.').pop() || 'file';
                const fileName = `${user_id}/${Date.now()}-${index + 1}.${fileExtension}`;
                const { data, error } = await supabase.storage.from('posts').upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                });
                if (error) {
                    throw error;
                }
                return data?.path;
            })
            const uploadedFiles = await Promise.all(uploadPromises)
            if (uploadedFiles.length === 0) {
                throw new Error("no files uploaded");
            }

            const { error } = await supabase.from('posts').insert({
                user_id,
                caption,
                files: uploadedFiles,
            });

            if (error) {
                throw error;
            }
            setFiles([]);
            setCaption('');
            setIsUploading(false);

            window.location.reload();

        } catch (error) {
            console.error("error uploading files:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="bg-[#ec3750]/90"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-3xl rounded-xl overflow-hidden border-0 shadow-xl">
                <DialogTitle className="sr-only">Create new post</DialogTitle>

                {currentStep === 'select' ? (
                    <div className="flex flex-col">
                        <div className="p-4 flex items-center border-b justify-center relative">
                            <h1 className="text-xl font-medium">Create new post</h1>
                        </div>

                        <div
                            className={`
                                flex flex-col items-center justify-center p-8
                                min-h-[550px] bg-white
                                ${isDragging ? 'bg-[#ec3750]/5 border-[#ec3750]' : ''}
                                border-2 border-dashed border-gray-300 m-6 rounded-lg
                                transition-all duration-200 ease-in-out
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={openFileDialog}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*,video/*"
                                multiple
                            />

                            <div className="text-center">
                                <svg aria-label="Icon to represent media such as images or videos" className="mx-auto mb-8" fill="currentColor" height="77" role="img" viewBox="0 0 97.6 77.3" width="96"><path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path><path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" fill="currentColor"></path><path d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z" fill="currentColor"></path></svg>
                                <h2 className="text-2xl font-medium mb-4">Drag photos and videos here</h2>
                                <p className="text-gray-500 mb-12 text-lg">Share your latest hack, project, or idea</p>
                                <Button
                                    type="button"
                                    className="bg-[#ec3750] hover:bg-[#ec3750]/90 text-white px-6 py-2 text-base h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openFileDialog();
                                    }}
                                >
                                    Select from computer
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex">
                        <div className="flex-1 relative bg-black">
                            <button
                                className="absolute left-4 top-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1"
                                onClick={handleGoBack}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <Carousel className="w-full">
                                <CarouselContent>
                                    {files.map((file, index) => {
                                        return (
                                            <CarouselItem key={index} className="flex items-center justify-center p-0">
                                                {file.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index}`}
                                                        className="w-full h-auto object-contain"
                                                        style={{ maxHeight: '80vh' }}
                                                    />
                                                ) : file.type.startsWith('video/') ? (
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        controls
                                                        autoPlay
                                                        className="w-full h-auto object-contain"
                                                        style={{ maxHeight: '80vh' }}
                                                    />
                                                ) : (
                                                    <div className="text-white p-8">
                                                        <span className="text-lg">Unsupported file:</span>
                                                        <p className="mt-2 text-gray-300">{file.name}</p>
                                                    </div>
                                                )}
                                            </CarouselItem>
                                        );
                                    })}
                                </CarouselContent>

                                {files.length > 1 && (
                                    <>
                                        <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white">
                                            <ChevronLeft className="h-6 w-6" />
                                        </CarouselPrevious>
                                        <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white">
                                            <ChevronRight className="h-6 w-6" />
                                        </CarouselNext>
                                    </>
                                )}
                            </Carousel>
                        </div>

                        <div className="w-[350px] flex flex-col bg-white border-l">
                            <div className="p-4 border-b flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <span className="font-medium text-sm">
                                        <img
                                            src={data?.user?.user_metadata?.avatar_url}
                                            alt="User Avatar"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {data?.user?.user_metadata?.name}
                                </span>
                            </div>

                            <div className="flex-1 p-4">
                                <textarea
                                    placeholder="Write a caption..."
                                    className="w-full h-full p-0 bg-transparent focus:outline-none resize-none text-sm"
                                    autoFocus
                                    onChange={(e) => setCaption(e.target.value)}
                                    value={caption}
                                />
                            </div>

                            <div className="p-4 border-t flex justify-between items-center">
                                <div className="flex items-center">
                                    <ImageIcon size={18} className="text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-500">
                                        {files.length} {files.length === 1 ? 'file' : 'files'}
                                    </span>
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-[#ec3750] hover:bg-[#ec3750]/90 text-white"
                                    onClick={handleShare}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                      <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                      </div>
                                    ) : (
                                      'Share'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}