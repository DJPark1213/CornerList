"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const FOR_HOSTS: FaqItem[] = [
  {
    question: "How do I book a DJ?",
    answer:
      "Search for DJs on the Search page, open a DJ's profile, and click Request Booking. Fill in your event details — date, time, event type, and guest count — and submit. The DJ will receive a notification and can accept or decline within 48 hours.",
  },
  {
    question: "How does payment work?",
    answer:
      "Payment is only collected after a DJ accepts your request. You'll see a Pay now button on the DJ's profile — clicking it takes you to a secure Stripe checkout. Your card is charged immediately, and the booking is confirmed once payment clears.",
  },
  {
    question: "What cards and payment methods are accepted?",
    answer:
      "All major credit and debit cards are accepted via Stripe (Visa, Mastercard, American Express, Discover). Apple Pay and Google Pay are supported on compatible devices.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Cancellation support is coming soon. For urgent situations, please contact us directly and we'll help resolve it.",
  },
  {
    question: "What if the DJ cancels or doesn't show up?",
    answer:
      "We take no-shows seriously. If a DJ fails to fulfill a confirmed booking, contact us and we'll issue a full refund and investigate the DJ's account.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. CornerList never stores your card details. All payments are processed by Stripe, which is PCI-DSS Level 1 certified — the highest level of payment security.",
  },
];

const FOR_DJS: FaqItem[] = [
  {
    question: "How do I join as a DJ?",
    answer:
      "Click Join as a DJ in the navigation bar, sign in with Google, and complete the profile wizard. You'll need a stage name, at least one genre, and a hourly rate. Your profile goes live immediately after submission.",
  },
  {
    question: "When and how do I get paid?",
    answer:
      "Stripe processes payments on your behalf. You'll need to connect a Stripe account to receive payouts (coming soon). Funds are transferred after the event date, minus a small platform fee.",
  },
  {
    question: "Can I decline booking requests?",
    answer:
      "Yes. Every booking request shows up on your profile page under Bookings. You can accept or decline each one. Hosts are notified by email either way.",
  },
  {
    question: "Can I update my profile after signing up?",
    answer:
      "Yes. Once you're signed in as a DJ, click My Profile in the navbar, then Edit profile. You can update your stage name, rate, genres, bio, equipment, availability, and photo at any time.",
  },
  {
    question: "Is there a fee to list my profile?",
    answer:
      "Listing your profile is completely free. CornerList takes a small percentage of each completed booking to keep the platform running.",
  },
];

function FaqSection({ title, items }: { title: string; items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <span>{item.question}</span>
              <span className="ml-4 shrink-0 text-muted">
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-muted leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted">
          Everything you need to know about booking and listing on CornerList.
        </p>
      </div>

      <div className="space-y-12">
        <FaqSection title="For Hosts" items={FOR_HOSTS} />
        <FaqSection title="For DJs" items={FOR_DJS} />
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-surface p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Still have questions?
        </h3>
        <p className="mt-2 text-sm text-muted">
          Reach out and we&apos;ll get back to you as soon as possible.
        </p>
        <a
          href="mailto:1213dongju@gmail.com"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Contact us
        </a>
      </div>
    </main>
  );
}
