"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Genre } from "@/types/dj";
import StepIndicator from "./StepIndicator";

const ALL_GENRES: Genre[] = [
  "Hip-Hop",
  "EDM",
  "Pop",
  "House",
  "R&B",
  "Latin",
  "Rock",
  "Top 40",
];

type FormState = {
  stageName: string;
  yearsExperience: string;
  contactEmail: string;
  genres: Genre[];
  pricePerHour: string;
  about: string;
  profileImage: string | null;
};

export default function JoinDjWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    stageName: "",
    yearsExperience: "",
    contactEmail: "",
    genres: [],
    pricePerHour: "",
    about: "",
    profileImage: null,
  });

  const set = (partial: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const toggleGenre = (genre: Genre) => {
    setForm((prev) =>
      prev.genres.includes(genre)
        ? { ...prev, genres: prev.genres.filter((g) => g !== genre) }
        : { ...prev, genres: [...prev.genres, genre] }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      set({ profileImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const canProceed = () => {
    if (step === 1)
      return form.stageName.trim() && form.contactEmail.trim();
    if (step === 2)
      return form.genres.length > 0 && Number(form.pricePerHour) > 0;
    return true;
  };

  const totalSteps = 4;
  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Welcome to CornerList!
        </h2>
        <p className="mt-2 text-muted">
          Your DJ profile has been saved (mock). Once we connect the backend,
          hosts will be able to find and book you.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-xl border border-border bg-surface p-5 text-left">
          <div className="flex items-start gap-3">
            {form.profileImage ? (
              <Image
                src={form.profileImage}
                alt="Profile"
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl text-primary">
                ♪
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {form.stageName}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {form.yearsExperience
                  ? `${form.yearsExperience} years experience`
                  : "Experience not set"}{" "}
                · ${form.pricePerHour || "0"}/hr
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {form.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary-hover"
              >
                {g}
              </span>
            ))}
          </div>
          {form.about && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {form.about}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Join CornerList as a DJ
      </h1>
      <p className="mt-2 text-sm text-muted">
        Tell us about your experience and style. You can adjust everything later
        in your profile.
      </p>

      <div className="mt-6">
        <StepIndicator
          currentStep={step}
          totalSteps={totalSteps}
          labels={["Basics", "Style & Rate", "Photo", "Bio & Preview"]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Stage name <span className="text-danger">*</span>
              </label>
              <input
                value={form.stageName}
                onChange={(e) => set({ stageName: e.target.value })}
                placeholder="e.g. DJ Mike Beats"
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Years of experience
              </label>
              <input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => set({ yearsExperience: e.target.value })}
                placeholder="e.g. 3"
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Contact email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set({ contactEmail: e.target.value })}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted">
                Used for booking notifications. Will be verified.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Style & Rate */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Genres <span className="text-danger">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      form.genres.includes(g)
                        ? "border-primary bg-primary/15 text-primary-hover"
                        : "border-border bg-surface-light text-muted hover:border-border-hover"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Hourly rate ($) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.pricePerHour}
                onChange={(e) => set({ pricePerHour: e.target.value })}
                placeholder="e.g. 150"
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 3: Profile Photo */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Profile picture
              </label>
              <p className="mb-4 text-xs text-muted">
                Upload a photo of yourself DJing or a professional headshot.
                This is what hosts see first.
              </p>

              <div className="flex flex-col items-center gap-4">
                {/* Preview */}
                <div className="relative">
                  {form.profileImage ? (
                    <Image
                      src={form.profileImage}
                      alt="Profile preview"
                      width={144}
                      height={144}
                      unoptimized
                      className="h-36 w-36 rounded-full border-2 border-primary/40 object-cover shadow-lg shadow-primary/20"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-border bg-surface-light text-4xl text-muted/30">
                      ♪
                    </div>
                  )}
                </div>

                {/* Upload controls */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-border bg-surface-light px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {form.profileImage ? "Change photo" : "Upload photo"}
                  </button>
                  {form.profileImage && (
                    <button
                      type="button"
                      onClick={() => set({ profileImage: null })}
                      className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted">
              You can skip this step and add a photo later.
            </p>
          </div>
        )}

        {/* Step 4: Bio & Preview */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Bio
              </label>
              <textarea
                rows={5}
                value={form.about}
                onChange={(e) => set({ about: e.target.value })}
                placeholder="Tell hosts about yourself, your style, and what makes your sets special..."
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* Live preview */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted">
                Profile preview
              </h3>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  {form.profileImage ? (
                    <Image
                      src={form.profileImage}
                      alt="Preview"
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg text-primary">
                      ♪
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {form.stageName || "Your DJ Name"}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted">
                      {form.yearsExperience
                        ? `${form.yearsExperience} yrs exp`
                        : "Experience"}
                      {form.pricePerHour
                        ? ` · $${form.pricePerHour}/hr`
                        : " · Price"}
                    </p>
                    {form.genres.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {form.genres.map((g) => (
                          <span
                            key={g}
                            className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary-hover"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                    {form.about && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted">
                        {form.about}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={step === totalSteps ? handleFinish : next}
            disabled={!canProceed()}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-40 disabled:shadow-none"
          >
            {step === totalSteps ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
