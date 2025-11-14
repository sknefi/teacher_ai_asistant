"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type UploadFeedback = {
  type: "error" | "success";
  message: string;
};

type LessonUploadFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  feedback?: UploadFeedback | null;
};

type MetadataFormState = {
  teacher_name: string;
  school_name: string;
  region: string;
  age_group: string;
  subject: string;
  lesson_type: string;
  curriculum_goal: string;
  language_of_instruction: string;
};

const DEFAULT_METADATA: MetadataFormState = {
  teacher_name: "Ms. Novak",
  school_name: "Gymnazium Praha",
  region: "Central Bohemia, Czech Republic",
  age_group: "Upper primary (9–11 years)",
  subject: "Mathematics",
  lesson_type: "Practice / consolidation",
  curriculum_goal: "Students consolidate multi-digit division strategies.",
  language_of_instruction: "Czech"
};

export function LessonUploadForm({ onSubmit, isSubmitting, feedback }: LessonUploadFormProps) {
  const [metadata, setMetadata] = React.useState<MetadataFormState>(DEFAULT_METADATA);
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAudioFile(file ?? null);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!audioFile) {
      setLocalError("Please attach an MP3, WAV, or M4A file.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("metadata", JSON.stringify(metadata));
    await onSubmit(formData);
  };

  React.useEffect(() => {
    if (feedback?.type === "success") {
      setAudioFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [feedback]);

  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Upload a new lesson</CardTitle>
        <CardDescription>Attach audio and contextual details to generate a fresh evaluation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Teacher name" name="teacher_name">
              <Input id="teacher_name" name="teacher_name" value={metadata.teacher_name} onChange={handleInputChange} required />
            </FormField>
            <FormField label="School name" name="school_name">
              <Input id="school_name" name="school_name" value={metadata.school_name} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Region" name="region">
              <Input id="region" name="region" value={metadata.region} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Age group" name="age_group">
              <Input id="age_group" name="age_group" value={metadata.age_group} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Subject" name="subject">
              <Input id="subject" name="subject" value={metadata.subject} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Lesson type" name="lesson_type">
              <Input id="lesson_type" name="lesson_type" value={metadata.lesson_type} onChange={handleInputChange} required />
            </FormField>
            <FormField className="md:col-span-2" label="Curriculum goal" name="curriculum_goal">
              <Textarea id="curriculum_goal" name="curriculum_goal" value={metadata.curriculum_goal} onChange={handleInputChange} rows={3} />
            </FormField>
            <FormField label="Language of instruction" name="language_of_instruction">
              <Input
                id="language_of_instruction"
                name="language_of_instruction"
                value={metadata.language_of_instruction}
                onChange={handleInputChange}
                required
              />
            </FormField>
          </div>

          <div className="space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-900">Audio file</p>
            <p className="text-xs text-muted-foreground">Supported formats: MP3, WAV, M4A (max few hundred MB recommended).</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload audio file"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </Button>
              <p className="text-sm text-muted-foreground">
                {audioFile ? (
                  <>
                    <span className="font-semibold text-slate-900">{audioFile.name}</span> ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
                  </>
                ) : (
                  "No file selected yet."
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <UploadCloud className="h-4 w-4" />
              {isSubmitting ? "Evaluating..." : "Send to evaluator"}
            </Button>
            {localError && <p className="text-sm text-rose-600">{localError}</p>}
            {feedback && (
              <p className={`text-sm ${feedback.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>{feedback.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const FormField = ({
  children,
  label,
  name,
  className
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  className?: string;
}) => (
  <div className={className}>
    <label htmlFor={name} className="text-sm font-medium text-slate-900">
      {label}
    </label>
    <div className="mt-1">{children}</div>
  </div>
);
