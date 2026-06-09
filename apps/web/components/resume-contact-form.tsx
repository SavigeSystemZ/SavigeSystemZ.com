"use client";

import { useState } from "react";

export function ResumeContactForm() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      setFormState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setFormState("idle"), 5000);
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-200">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition-colors focus:border-cyan-500 focus:bg-white/10 focus:outline-none"
            placeholder="Your name"
            disabled={formState === "loading"}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-200">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition-colors focus:border-cyan-500 focus:bg-white/10 focus:outline-none"
            placeholder="your@email.com"
            disabled={formState === "loading"}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-200">
          Subject *
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors focus:border-cyan-500 focus:bg-white/10 focus:outline-none"
          disabled={formState === "loading"}
        >
          <option value="">Select a subject</option>
          <option value="Collaboration">Collaboration opportunity</option>
          <option value="Consulting">Consulting inquiry</option>
          <option value="Partnership">Business partnership</option>
          <option value="Feedback">Feedback or suggestion</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-200">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition-colors focus:border-cyan-500 focus:bg-white/10 focus:outline-none"
          placeholder="Tell me about your project or inquiry..."
          disabled={formState === "loading"}
        />
      </div>

      {formState === "error" && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>
      )}

      {formState === "success" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-200">
            ✓ Message sent successfully! I&apos;ll get back to you soon.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={formState === "loading" || formState === "success"}
        className="w-full rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === "loading" ? "Sending..." : "Send Message"}
      </button>

      <p className="text-xs text-slate-500">
        * Required fields. Your message will be kept confidential.
      </p>
    </form>
  );
}
