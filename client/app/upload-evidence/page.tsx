"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios, { AxiosResponse } from "axios"

interface FileWithPreview extends File {
    preview: string
}

interface ApiResponse {
    success: boolean
    message: string
    data?: string
}

export default function EvidenceUpload() {
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [ocrResults, setOcrResults] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview))
    }, [files])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).map(file =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
            ) as FileWithPreview[]
            setFiles(prevFiles => [...prevFiles, ...newFiles])
        }
    }

    const handleUpload = async (): Promise<void> => {
        if (files.length > 0) {
            setIsUploading(true)
            const formData = new FormData()

            files.forEach((file) => {
                formData.append('imageFiles', file)
            })

            try {
                const response: AxiosResponse<ApiResponse> = await axios.post("/api/azure/ocr", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                if (response.data.success) {
                    if (response.data.data) {
                        setOcrResults(response.data.data)
                    }
                    toast({
                        title: "Upload Successful",
                        description: "Your evidence has been processed successfully.",
                    })
                    setFiles([])
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                    }
                } else {
                    throw new Error(response.data.message)
                }
            } catch (error) {
                console.error("Error uploading files:", error)
                toast({
                    title: "Upload Failed",
                    description: error instanceof Error ? error.message : "Failed to upload files. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleRemoveFile = (fileToRemove: FileWithPreview) => {
        setFiles(files.filter(file => file !== fileToRemove))
        URL.revokeObjectURL(fileToRemove.preview)
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Evidence Upload (WhatsApp Chat)</CardTitle>
                <CardDescription>Upload multiple image evidence for your case</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors duration-200"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                            </div>
                            <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                                ref={fileInputRef}
                                multiple
                                disabled={isUploading}
                            />
                        </Label>
                    </div>
                    {files.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={file.preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                                        <div className="text-white text-center p-2">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs">{file.type}</p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveFile(file)}
                                                className="mt-2"
                                                disabled={isUploading}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={files.length === 0 || isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        `Upload Evidence (${files.length} file${files.length !== 1 ? 's' : ''})`
                    )}
                </Button>
                {ocrResults && (
                    <div className="w-full p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">OCR Results:</h3>
                        <p className="text-sm">{ocrResults}</p>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}