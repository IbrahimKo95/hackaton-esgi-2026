'use client';

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

type Props = {
  restaurantId: number;
  restaurantName: string;
  seatingCap: number | null;
  fullyBookedDates: string[];
};

type Step = "date" | "time" | "summary";

const TIME_SLOTS = [
  "12:00",
  "13:00",
  "14:00",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

const LUNCH_TIME_SLOTS = TIME_SLOTS.slice(0, 3);
const DINNER_TIME_SLOTS = TIME_SLOTS.slice(3);

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fromDateKey(value));
}

function formatSummaryDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(fromDateKey(value));
}

function setReservationVisibility(visible: boolean) {
  window.dispatchEvent(
    new CustomEvent("restaurant-reservation-visibility", {
      detail: { visible },
    }),
  );
}

export default function RestaurantReservationPanel({
  restaurantId,
  restaurantName,
  seatingCap,
  fullyBookedDates,
}: Props) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fullyBookedSet = useMemo(() => new Set(fullyBookedDates), [fullyBookedDates]);

  const selectedDateObject = fromDateKey(selectedDate);
  const today = startOfToday();
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const monthEnd = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + monthEnd.getDate()) / 7) * 7;
  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    if (dayNumber < 1 || dayNumber > monthEnd.getDate()) {
      return null;
    }

    return new Date(viewMonth.getFullYear(), viewMonth.getMonth(), dayNumber, 12, 0, 0, 0);
  });

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const isLoadingSession = status === "loading";

  function isDateDisabled(date: Date) {
    return date < today || fullyBookedSet.has(toDateKey(date));
  }

  function openDrawer() {
    const baseDate = selectedDateObject < today ? today : selectedDateObject;
    setViewMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setStep("date");
    setErrorMessage(null);
    setStatusMessage(null);
    setReservationVisibility(true);
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
    setReservationVisibility(false);
  }

  async function submitReservation() {
    if (!selectedDate || !selectedTime) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const userId = session?.user?.id?.trim() ?? "";
      const userEmail = session?.user?.email?.trim().toLowerCase() ?? "";

      const response = await fetch(`/api/restaurants/${restaurantId}/reservations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(`${selectedDate}T${selectedTime}:00`),
          guestCount,
          userId,
          userEmail,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "La reservation a echoue.");
      }

      setStatusMessage("Reservation confirmee.");
      closeDrawer();
      setStep("date");
      setSelectedTime("");
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderCalendar() {
    return (
      <div className="mt-4">
        <h5 className="mb-3 text-[20px] font-semibold tracking-[-0.02em] text-black">Sélectionner une date</h5>

        <div className="rounded-[28px] border border-black bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
            <p className="text-[15px] font-semibold capitalize tracking-[-0.01em] text-black">
              {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(monthStart)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white transition hover:bg-black/5"
                aria-label="Mois precedent"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white transition hover:bg-black/5"
                aria-label="Mois suivant"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-black/35">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="flex h-11 items-center justify-center" />;
              }

              const dayKey = toDateKey(day);
              const disabled = isDateDisabled(day);
              const active = selectedDate === dayKey;

              return (
                <button
                  key={dayKey}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(dayKey);
                    setStep("date");
                    if (fromDateKey(dayKey).getTime() !== selectedDateObject.getTime()) {
                      setSelectedTime("");
                    }
                  }}
                  className={`flex h-11 items-center justify-center rounded-full text-[14px] font-medium transition ${
                    disabled
                      ? "cursor-not-allowed bg-black/0 text-black/20"
                      : active
                        ? "bg-[#d61f26] text-white shadow-[0_6px_16px_rgba(214,31,38,0.22)]"
                        : "bg-transparent text-black hover:bg-black/5"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3">
          <div>
            <p className="text-[13px] font-medium">Convives</p>
            <p className="text-[12px] text-black/55">Capacite {seatingCap ? `max ${seatingCap}` : "indisponible"}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#fafafa] p-1">
            <button
              type="button"
              onClick={() => setGuestCount((current) => Math.max(1, current - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[18px] leading-none transition hover:bg-black/5"
              aria-label="Diminuer les convives"
            >
              -
            </button>
            <span className="min-w-8 px-1 text-center text-[14px] font-semibold">{guestCount}</span>
            <button
              type="button"
              onClick={() => setGuestCount((current) => current + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[18px] leading-none transition hover:bg-black/5"
              aria-label="Augmenter les convives"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderTimeSlots() {
    return (
      <div className="mt-4 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h5 className="text-[20px] font-semibold tracking-[-0.02em] text-black">Sélectionner une heure</h5>
            <p className="mt-1 text-[13px] font-medium text-black/45">{formatDateLabel(selectedDate)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-black/45">Service du midi</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {LUNCH_TIME_SLOTS.map((slot) => {
                const active = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-[16px] border px-3 py-3 text-[14px] font-medium transition ${
                      active
                        ? "border-[#d61f26] bg-[#d61f26] text-white shadow-[0_8px_18px_rgba(214,31,38,0.22)]"
                        : "border-black/20 bg-[#fbfbf8] text-black hover:bg-black/[0.03]"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-black/45">Service du soir</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DINNER_TIME_SLOTS.map((slot) => {
                const active = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-[16px] border px-3 py-3 text-[14px] font-medium transition ${
                      active
                        ? "border-[#d61f26] bg-[#d61f26] text-white shadow-[0_8px_18px_rgba(214,31,38,0.22)]"
                        : "border-black/20 bg-[#fbfbf8] text-black hover:bg-black/[0.03]"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSummary() {
    return (
      <div className="mt-4 rounded-[24px] border border-black/10 bg-[#fafafa] p-4">
        <div className="space-y-3 text-[14px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-black/55">Restaurant</span>
            <span className="font-medium">{restaurantName}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-black/55">Date</span>
            <span className="font-medium">{formatSummaryDate(selectedDate)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-black/55">Horaire</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-black/55">Convives</span>
            <span className="font-medium">{guestCount}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mt-8 rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <h3 className="text-[18px] font-semibold">Reserver une table</h3>
        <p className="mt-2 text-[14px] text-black/70">
          Connectez-vous pour reserver une table chez {restaurantName}.
        </p>
        {isLoadingSession ? (
          <p className="mt-3 text-[13px] text-black/50">Chargement...</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[18px] font-semibold">Reserver une table</h3>
          <p className="mt-1 text-[14px] text-black/70">
            {seatingCap ? `Capacite maximale : ${seatingCap} convives par jour.` : "Capacite non renseignee."}
          </p>
        </div>
        <button
          type="button"
          onClick={openDrawer}
          className="rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-black/85"
        >
          Reserver
        </button>
      </div>

      {statusMessage ? <p className="mt-3 text-[13px] text-[#25734c]">{statusMessage}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-3 pt-10 md:items-center md:px-6 md:pb-6">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Fermer le menu de reservation"
            onClick={closeDrawer}
          />
          <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-t-[30px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.18)] md:rounded-[32px]">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/45">Reservation</p>
                <h4 className="text-[18px] font-semibold">{restaurantName}</h4>
              </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-black/10 p-2 transition hover:bg-black/5"
                  aria-label="Fermer"
                >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center justify-between gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-black/35">
                {(["date", "time", "summary"] as Step[]).map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${step === item ? "bg-black" : "bg-black/15"}`} />
                    <span>{index + 1}</span>
                  </div>
                ))}
              </div>

              {step === "date" ? renderCalendar() : null}
              {step === "time" ? renderTimeSlots() : null}
              {step === "summary" ? renderSummary() : null}

              {errorMessage ? <p className="mt-3 text-[13px] text-[#c1282d]">{errorMessage}</p> : null}

              <div className="mt-5 flex items-center justify-between gap-3">
                {step === "time" ? (
                  <button
                    type="button"
                    onClick={() => setStep("date")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:bg-black/[0.03]"
                    aria-label="Retour à la sélection de date"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : step === "summary" ? (
                  <button
                    type="button"
                    onClick={() => setStep("time")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:bg-black/[0.03]"
                    aria-label="Retour à la sélection d'heure"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span />
                )}

                {step === "date" ? (
                  <button
                    type="button"
                    onClick={() => setStep("time")}
                    disabled={!selectedDate || isDateDisabled(selectedDateObject)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/20"
                    aria-label="Choisir un horaire"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}

                {step === "time" ? (
                  <button
                    type="button"
                    onClick={() => setStep("summary")}
                    disabled={!selectedTime}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/20"
                    aria-label="Voir le recapitulatif"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}

                {step === "summary" ? (
                  <button
                    type="button"
                    onClick={() => void submitReservation()}
                    disabled={submitting}
                    className="rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/20"
                  >
                    {submitting ? "Confirmation..." : "Confirmer"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
