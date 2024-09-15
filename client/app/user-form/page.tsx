"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, Mic } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios, { AxiosResponse } from "axios"
import { z, ZodType } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUser } from "@/lib/action/user.action"

type UserCreateFormData = {
    name: string
    contact: string
    address: string
    email: string
    context: {
        chats: { key: string; value: string; }[]
        voiceRecording: { key: string; value: string; }[]
        imageAnalysis: string | null
        audioTranscription: string | null
    }
}

const userSchema: ZodType<UserCreateFormData> = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    contact: z.string().min(10, "Contact must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    context: z.object({
        chats: z.array(z.object({ key: z.string(), value: z.string() })),
        voiceRecording: z.array(z.object({ key: z.string(), value: z.string() })),
        imageAnalysis: z.string().nullable(),
        audioTranscription: z.string().nullable(),
    })
})

interface FileWithPreview extends File {
    preview: string
}

interface ApiResponse {
    success: boolean
    message: string
    data?: string
}

export default function UserForm() {
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [ocrResults, setOcrResults] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioInputRef = useRef<HTMLInputElement>(null)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [isUploadingAudio, setIsUploadingAudio] = useState(false)
    const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null)
    const { toast } = useToast()

    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
        reset
    } = useForm<UserCreateFormData>({
        resolver: zodResolver(userSchema),
    })

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview))
    }, [files])

    const onSubmit = async (data: UserCreateFormData) => {
        try {
            setSubmitStatus('idle')
            const response = await createUser(data)
            if (response) {
                setSubmitStatus('success')
                reset()
            } else {
                setSubmitStatus('error')
                console.error("User not created")
            }
        } catch (error) {
            setSubmitStatus('error')
            console.error(`Error creating user: ${error}`)
        }
    }

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

    const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAudioFile(event.target.files[0])
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

    const handleAudioUpload = async (): Promise<void> => {
        if (audioFile) {
            setIsUploadingAudio(true)
            const formData = new FormData()
            formData.append('audioFile', audioFile)

            try {
                const response: AxiosResponse<ApiResponse> = await axios.post("/api/openai/whisper", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                if (response.data.success) {
                    if (response.data.data) {
                        setTranscriptionResult(response.data.data)
                    }
                    toast({
                        title: "Transcription Successful",
                        description: "Your call recording has been transcribed successfully.",
                    })
                    setAudioFile(null)
                    if (audioInputRef.current) {
                        audioInputRef.current.value = ""
                    }
                } else {
                    throw new Error(response.data.message)
                }
            } catch (error) {
                console.error("Error uploading audio file:", error)
                toast({
                    title: "Transcription Failed",
                    description: error instanceof Error ? error.message : "Failed to transcribe audio. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsUploadingAudio(false)
            }
        }
    }

    const handleRemoveFile = (fileToRemove: FileWithPreview) => {
        setFiles(files.filter(file => file !== fileToRemove))
        URL.revokeObjectURL(fileToRemove.preview)
    }

    return (
        <div className="space-y-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Scam Assistance Service</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        {[
                            { id: "name", label: "Name", placeholder: "John Doe", type: "text" },
                            { id: "contact", label: "Contact", placeholder: "123-456-7890", type: "text" },
                            { id: "address", label: "Address", placeholder: "123 Main St, Anytown USA", type: "text" },
                            { id: "context", label: "Context", placeholder: "Provide additional context", type: "text" },
                        ].concat({ id: "email", label: "Email", placeholder: "john@example.com", type: "email" }).map(({ id, label, placeholder, type }) => (
                            <div key={id} className="grid gap-2">
                                <Label htmlFor={id}>{label}</Label>
                                <Input
                                    id={id}
                                    placeholder={placeholder}
                                    type={type}
                                    {...register(id as keyof UserCreateFormData)}
                                />
                                {errors[id as keyof UserCreateFormData] && (
                                    <p className="text-sm text-red-500">
                                        {errors[id as keyof UserCreateFormData]?.message}
                                    </p>
                                )}
                            </div>
                        ))}
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-end gap-2">
                    <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                    {submitStatus === 'success' && (
                        <p className="text-sm text-green-500">User created successfully!</p>
                    )}
                    {submitStatus === 'error' && (
                        <p className="text-sm text-red-500">Error creating user. Please try again.</p>
                    )}
                </CardFooter>
            </Card>

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

            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Call Recording Upload</CardTitle>
                    <CardDescription>Upload a call recording for transcription</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <Label
                                htmlFor="audio-upload"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors duration-200"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Mic className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 25MB</p>
                                </div>
                                <Input
                                    id="audio-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleAudioFileChange}
                                    accept="audio/*"
                                    ref={audioInputRef}
                                    disabled={isUploadingAudio}
                                />
                            </Label>
                        </div>
                        {audioFile && (
                            <div className="text-sm">
                                <p>Selected file: {audioFile.name}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        className="w-full"
                        onClick={handleAudioUpload}
                        disabled={!audioFile || isUploadingAudio}
                    >
                        {isUploadingAudio ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Transcribing...
                            </>
                        ) : (
                            'Transcribe Call Recording'
                        )}
                    </Button>
                    {transcriptionResult && (
                        <div className="w-full p-4 bg-muted rounded-lg">
                            <h3 className="font-semibold mb-2">Transcription Result:</h3>
                            <p className="text-sm">{transcriptionResult}</p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}