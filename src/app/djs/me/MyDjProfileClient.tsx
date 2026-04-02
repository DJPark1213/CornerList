"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Dj, Genre, Review } from "@/types/dj";
import { GENRE_DISPLAY_TO_SLUG } from "@/lib/genre-slugs";
import {
  DjProfileHeader,
  ProfileBookingPanel,
  DjAboutSection,
  DjDetailsSection,
  DjReviewsSection,
} from "@/features/dj-profile";
import DjBookingsSection from "./DjBookingsSection";

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

type DjBooking = {
  id: string;
  status: string;
  payment_status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string | null;
  guest_count: number | null;
  host_name: string | null;
};

type Props = {
  dj: Dj;
  reviews: Review[];
  contactEmail: string | null;
  stripeConnected: boolean;
  stripeDetailsSubmitted: boolean;
  djBookings: DjBooking[];
};

type EditForm = {
  stageName: string;
  yearsExperience: string;
  contactEmail: string;
  location: string;
  genres: Genre[];
  pricePerHour: string;
  about: string;
  equipmentSummary: string;
  availabilitySummary: string;
  profileImage: string | null;
};

export default function MyDjProfileClient({ dj, reviews, contactEmail, stripeConnected, stripeDetailsSubmitted, djBookings }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentDj, setCurrentDj] = useState(dj);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EditForm>({
    stageName: dj.stageName,
    yearsExperience: dj.yearsExperience > 0 ? String(dj.yearsExperience) : "",
    contactEmail: contactEmail ?? "",
    location: dj.location,
    genres: dj.genres,
    pricePerHour: String(dj.pricePerHour),
    about: dj.about,
    equipmentSummary: dj.equipmentSummary,
    availabilitySummary: dj.availabilitySummary,
    profileImage: null,
  });

  const set = (partial: Partial<EditForm>) =>
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
    reader.onloadend = () => set({ profileImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      let profileImageUrl: string | undefined;
      if (form.profileImage?.startsWith("data:")) {
        const blob = await fetch(form.profileImage).then((r) => r.blob());
        const fd = new FormData();
        fd.append("file", blob, "profile.jpg");
        fd.append("type", "profile-photo");
        const up = await fetch("/api/dj-media", { method: "POST", body: fd });
        if (!up.ok) {
          const j = (await up.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? "Photo upload failed");
        }
        const { url } = (await up.json()) as { url: string };
        profileImageUrl = url;
      }

      const genreSlugs = form.genres.map((g) => GENRE_DISPLAY_TO_SLUG[g]);

      const res = await fetch("/api/dj-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageName: form.stageName,
          yearsExperience: form.yearsExperience
            ? Number(form.yearsExperience)
            : undefined,
          genres: genreSlugs,
          pricePerHour: Number(form.pricePerHour),
          contactEmail: form.contactEmail,
          location: form.location || undefined,
          about: form.about || undefined,
          equipmentSummary: form.equipmentSummary || undefined,
          availabilitySummary: form.availabilitySummary || undefined,
          profileImageUrl: profileImageUrl ?? null,
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Could not save profile");
      }

      setCurrentDj((prev) => ({
        ...prev,
        stageName: form.stageName,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
        pricePerHour: Number(form.pricePerHour),
        genres: form.genres,
        about: form.about,
        equipmentSummary: form.equipmentSummary,
        availabilitySummary: form.availabilitySummary,
        location: form.location,
        avatarUrl: profileImageUrl ?? prev.avatarUrl,
      }));
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const j = (await res.json()) as { url?: string; error?: string };
      if (j.url) window.location.href = j.url;
    } finally {
      setConnectingStripe(false);
    }
  };

  if (editing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <button
            type="button"
            onClick={() => { setEditing(false); setSaveError(null); }}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Cancel
          </button>
        </div>

        {saveError && (
          <p className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {saveError}
          </p>
        )}

        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
          {/* Profile photo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Profile photo
            </label>
            <div className="flex items-center gap-4">
              {form.profileImage ? (
                <Image
                  src={form.profileImage}
                  alt="Preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
              ) : currentDj.avatarUrl ? (
                <Image
                  src={currentDj.avatarUrl}
                  alt="Current photo"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-surface-light text-2xl text-muted/30">
                  ♪
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-primary"
              >
                {form.profileImage ?? currentDj.avatarUrl ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>

          {/* Stage name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Stage name <span className="text-danger">*</span>
            </label>
            <input
              value={form.stageName}
              onChange={(e) => set({ stageName: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Contact email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Contact email
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set({ contactEmail: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="e.g. Charlottesville, VA"
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Years of experience */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Years of experience
            </label>
            <input
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(e) => set({ yearsExperience: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Genres */}
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

          {/* Hourly rate */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Hourly rate ($) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.pricePerHour}
              onChange={(e) => set({ pricePerHour: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              rows={4}
              value={form.about}
              onChange={(e) => set({ about: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Equipment */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Equipment summary
            </label>
            <textarea
              rows={2}
              value={form.equipmentSummary}
              onChange={(e) => set({ equipmentSummary: e.target.value })}
              placeholder="e.g. Pioneer CDJ-3000s, Allen & Heath mixer, Shure SM58 mic"
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Availability summary
            </label>
            <textarea
              rows={2}
              value={form.availabilitySummary}
              onChange={(e) => set({ availabilitySummary: e.target.value })}
              placeholder="e.g. Weekends and evenings, book 2+ weeks in advance"
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setEditing(false); setSaveError(null); }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !form.stageName.trim() || form.genres.length === 0 || Number(form.pricePerHour) <= 0}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">My Profile</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Edit profile
        </button>
      </div>

      {/* Stripe payout banner */}
      {!stripeConnected && (
        <div className={`rounded-xl border p-4 ${stripeDetailsSubmitted ? "border-yellow-500/40 bg-yellow-500/10" : "border-danger/40 bg-danger/10"}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stripeDetailsSubmitted ? "Payout setup incomplete" : "Set up payouts to get paid"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {stripeDetailsSubmitted
                  ? "Finish your Stripe setup to start receiving payments from bookings."
                  : "Connect a bank account via Stripe so you can receive money from confirmed bookings."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleConnectStripe()}
              disabled={connectingStripe}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {connectingStripe ? "Redirecting…" : stripeDetailsSubmitted ? "Complete setup" : "Connect Stripe"}
            </button>
          </div>
        </div>
      )}

      {stripeConnected && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <p className="text-sm text-foreground">Payouts connected — you'll receive 90% of each booking payment.</p>
        </div>
      )}

      <div className="space-y-8">
        <DjProfileHeader dj={currentDj} isOwner />
        <ProfileBookingPanel dj={currentDj} />
        <DjAboutSection about={currentDj.about} />
        <DjDetailsSection
          equipmentSummary={currentDj.equipmentSummary}
          availabilitySummary={currentDj.availabilitySummary}
        />
        <DjReviewsSection reviews={reviews} />

        {/* Booking requests received */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Booking Requests</h2>
          <DjBookingsSection initial={djBookings} />
        </section>
      </div>
    </main>
  );
}
