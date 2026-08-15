/**
 * Free-trial state.
 *
 * The trial clock is driven by the account's real creation timestamp, which the
 * backend returns on login (`LoginResponse.createdAt`) and which the app stores
 * alongside the user in localStorage.
 *
 * If that value is unavailable — an older account created before the field was
 * added, or a seeded admin — we fall back to the first time this browser saw the
 * account, so the UI still renders something sensible instead of breaking.
 */

export const TRIAL_LENGTH_DAYS = 14;

const FALLBACK_KEY = "solvemate.trialStart";

export interface TrialState {
    /** When the trial began. */
    startDate: Date;
    /** Last day the trial is still active (inclusive). */
    endDate: Date;
    /** 1-based day counter, clamped to the trial length. Signup day is Day 1. */
    dayNumber: number;
    /** Whole days left, including today. Zero once expired. */
    daysRemaining: number;
    /** 0–100, how far through the trial the user is. */
    percentElapsed: number;
    /** True once the 14 days are used up. */
    expired: boolean;
    /** Human-readable end date, e.g. "29 August 2026". */
    endDateLabel: string;
    /** False when the start date was inferred rather than read from the account. */
    hasVerifiedStart: boolean;
}

export interface StoredUser {
    fullName?: string;
    email?: string;
    role?: string;
    createdAt?: string;
}

/** Reads the logged-in user out of localStorage, tolerating missing/corrupt data. */
export function getStoredUser(): StoredUser {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    } catch {
        return {};
    }
}

/** Strips the time component so day counts land on calendar boundaries. */
function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function resolveStartDate(createdAt?: string): { date: Date; verified: boolean } {
    if (createdAt) {
        const parsed = new Date(createdAt);
        if (!Number.isNaN(parsed.getTime())) return { date: parsed, verified: true };
    }

    // No usable timestamp from the account — remember when we first saw it.
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored) {
        const parsed = new Date(stored);
        if (!Number.isNaN(parsed.getTime())) return { date: parsed, verified: false };
    }

    const now = new Date();
    localStorage.setItem(FALLBACK_KEY, now.toISOString());
    return { date: now, verified: false };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Computes trial state. Pass the account's createdAt; omit it to read the
 * currently logged-in user from localStorage.
 */
export function getTrialState(createdAt?: string): TrialState {
    const source = createdAt ?? getStoredUser().createdAt;
    const { date: startDate, verified } = resolveStartDate(source);

    const msPerDay = 24 * 60 * 60 * 1000;
    const elapsedDays = Math.max(
        0,
        Math.floor((startOfDay(new Date()).getTime() - startOfDay(startDate).getTime()) / msPerDay),
    );

    const endDate = new Date(startOfDay(startDate).getTime() + (TRIAL_LENGTH_DAYS - 1) * msPerDay);
    const expired = elapsedDays >= TRIAL_LENGTH_DAYS;

    return {
        startDate,
        endDate,
        dayNumber: clamp(elapsedDays + 1, 1, TRIAL_LENGTH_DAYS),
        daysRemaining: expired ? 0 : TRIAL_LENGTH_DAYS - elapsedDays,
        percentElapsed: clamp((elapsedDays / TRIAL_LENGTH_DAYS) * 100, 0, 100),
        expired,
        endDateLabel: endDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        hasVerifiedStart: verified,
    };
}

/** Short label for compact spots like the sidebar badge. */
export function trialBadgeLabel(state: TrialState): string {
    if (state.expired) return "Trial ended";
    if (state.daysRemaining === 1) return "Trial · 1 day left";
    return `Trial · ${state.daysRemaining} days left`;
}
