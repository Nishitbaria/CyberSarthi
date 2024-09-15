'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, Mic, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface FileWithPreview extends File {
  preview: string
}

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  contact: z.string().min(10, "Contact must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
})

type UserFormData = z.infer<typeof userSchema>

export default function ScamReportingForm() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploading(true)
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      files.forEach((file) => {
        formData.append('imageFiles', file)
      })

      if (audioFile) {
        formData.append('audioFile', audioFile)
      }

      const response = await axios.post("/api/submit-form", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(response.data.data._id)
      if (response.data.success) {
        toast({
          title: "Report Submitted",
          description: "Your scam report has been successfully submitted.",
        })
        router.push(`/call-agent/${response.data.data._id}`)
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
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

  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter(file => file !== fileToRemove))
    URL.revokeObjectURL(fileToRemove.preview)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <CardTitle className="text-2xl font-bold">Scam Reporting Form</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Please provide details about the scam you've encountered. Your information helps us combat fraud.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                { id: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
                { id: "contact", label: "Contact Number", placeholder: "123-456-7890", type: "tel" },
                { id: "address", label: "Address", placeholder: "123 Main St, Anytown USA", type: "text" },
                { id: "email", label: "Email Address", placeholder: "john@example.com", type: "email" },
              ].map(({ id, label, placeholder, type }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id} className="font-medium text-gray-700">{label}</Label>
                  <Input
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    {...register(id as keyof UserFormData)}
                    className="w-full p-2 border rounded-md"
                  />
                  {errors[id as keyof UserFormData] && (
                    <p className="text-sm text-red-500">
                      {errors[id as keyof UserFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="font-medium text-gray-700">WhatsApp Chat Evidence</Label>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                    multiple
                  />
                </Label>
              </div>
              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFile(file)}
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="font-medium text-gray-700">Call Recording</Label>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="audio-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Mic className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> audio file</p>
                    <p className="text-xs text-gray-500">MP3, WAV, M4A up to 25MB</p>
                  </div>
                  <Input
                    id="audio-upload"
                    type="file"
                    className="hidden"
                    onChange={handleAudioFileChange}
                    accept="audio/*"
                    ref={audioInputRef}
                  />
                </Label>
              </div>
              {audioFile && (
                <div className="text-sm text-gray-600">
                  Selected file: {audioFile.name}
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 px-6 py-4">
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isUploading}
            className="w-full"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Submit Scam Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}