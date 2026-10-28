"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CameraCapture from "@/components/CameraCapture";
import ResultStep from "@/components/ResultStep";
import TemplatePicker from "@/components/TemplatePicker";
import { TEMPLATES, type PhotoboothTemplate } from "@/lib/photobooth";
import { translations, type Language } from "@/lib/i18n";

type Step = "template" | "camera" | "result";

const LANG_STORAGE_KEY = "photobooth-lang";

export default function Home() {
  // Default language is English; a saved choice in localStorage wins.
  const [lang, setLang] = useState<Language>("en");
  const [step, setStep] = useState<Step>("template");
  const [template, setTemplate] = useState<PhotoboothTemplate>(TEMPLATES[0]);
  const [photos, setPhotos] = useState<string[]>([]);

  const t = translations[lang];

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "th" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const stepIndex = step === "template" ? 0 : step === "camera" ? 1 : 2;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-10 pt-6">
      {/* Header + language switcher */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-violet-400">
            photobooth
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
        </div>
        <div
          role="group"
          aria-label="Language"
          className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-pink-200"
        >
          {(
            [
              { code: "en", label: "EN" },
              { code: "th", label: "TH" },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              aria-pressed={lang === item.code}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${lang === item.code
                  ? "bg-violet-400 text-white"
                  : "text-pink-500 hover:bg-pink-50"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Step indicator */}
      <ol className="mt-6 flex items-center gap-2">
        {t.steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === stepIndex
                  ? "bg-violet-400 text-white"
                  : i < stepIndex
                    ? "bg-pink-200 text-pink-700"
                    : "bg-white text-gray-400 ring-1 ring-pink-100"
                }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-sm sm:block ${i === stepIndex
                  ? "font-medium text-gray-800"
                  : "text-gray-400"
                }`}
            >
              {label}
            </span>
            {i < t.steps.length - 1 && (
              <span className="h-px flex-1 bg-pink-100" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      {/* Step content */}
      <section className="fade-in mt-6 rounded-[2rem] bg-white/70 p-4 shadow-sm shadow-pink-100 ring-1 ring-pink-100 sm:p-6">
        {step === "template" && (
          <>
            <TemplatePicker
              t={t}
              selected={template}
              onSelect={setTemplate}
            />
            <button
              type="button"
              onClick={() => setStep("camera")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-violet-400 py-4 text-base font-medium text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500"
            >
              {t.goToCamera}
              <Icon icon="lucide:arrow-right" width={20} height={20} aria-hidden="true" />
            </button>
          </>
        )}

        {step === "camera" && (
          <CameraCapture
            t={t}
            template={template}
            onBack={() => setStep("template")}
            onDone={(captured) => {
              setPhotos(captured);
              setStep("result");
            }}
          />
        )}

        {step === "result" && photos.length > 0 && (
          <ResultStep
            t={t}
            lang={lang}
            photos={photos}
            template={template}
            onRetake={() => {
              setPhotos([]);
              setStep("camera");
            }}
            onRestart={() => {
              setPhotos([]);
              setStep("template");
            }}
          />
        )}
      </section>

      <footer className="mt-6 text-center text-xs leading-relaxed text-gray-400">
        <p>{t.privacyNote}</p>
        <p className="mt-2 text-pink-400">
          Made with ♡ by Boomie (
          <a
            href="https://www.instagram.com/pawyd"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-pink-500 underline decoration-pink-300 underline-offset-2 hover:text-pink-600"
          >
            @pawyd
          </a>
          )
        </p>
      </footer>
    </main>
  );
}
