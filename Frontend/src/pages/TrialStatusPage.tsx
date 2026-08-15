import { useState } from "react";
import { getTrialState, getStoredUser, TRIAL_LENGTH_DAYS } from "../utils/trial";
import "../styles/pricing.css";
import "../styles/trial-status.css";

interface Props {
    onNavigate: (page: string) => void;
}

const TRIAL_INCLUDES = [
    "Full 541-solvent catalog",
    "Standard compatibility analysis",
    "Green Solvent Engine",
    "Basic SHAP explanations",
    "5 AI Assistant questions per day",
];

interface UpgradePlan {
    name: string;
    price: string;
    period: string;
    tagline: string;
    highlight: boolean;
    benefits: string[];
}

const UPGRADE_PLANS: UpgradePlan[] = [
    {
        name: "Pro",
        price: "Rs. 579",
        period: "per month",
        tagline: "For active researchers and small labs",
        highlight: true,
        benefits: [
            "Unlimited AI Research Assistant",
            "Exportable PDF reports",
            "Saved analysis history",
            "Bulk polymer comparison",
        ],
    },
    {
        name: "Team",
        price: "Rs. 2,499",
        period: "per month",
        tagline: "For research groups and small companies",
        highlight: false,
        benefits: [
            "Everything in Pro",
            "Multi-user accounts",
            "Admin dashboard access",
            "Shared trial history",
            "Priority support",
        ],
    },
];

const ENTERPRISE_PLAN: UpgradePlan = {
    name: "Enterprise",
    price: "Custom",
    period: "billed annually",
    tagline: "For manufacturers and large labs",
    highlight: false,
    benefits: [
        "API access",
        "Custom / on-premise deployment",
        "Custom solvent data integration",
        "Dedicated support",
    ],
};

/** Circular countdown ring. */
function TrialRing({ percentElapsed, dayNumber, expired }: {
    percentElapsed: number;
    dayNumber: number;
    expired: boolean;
}) {
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const progress = expired ? 1 : percentElapsed / 100;

    return (
        <div className="trial-ring">
            <svg viewBox="0 0 150 150" width="150" height="150">
                <circle
                    cx="75" cy="75" r={radius}
                    fill="none" strokeWidth="10"
                    className="trial-ring-track"
                />
                <circle
                    cx="75" cy="75" r={radius}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    transform="rotate(-90 75 75)"
                    className={`trial-ring-progress ${expired ? "ended" : ""}`}
                />
            </svg>
            <div className="trial-ring-label">
                {expired ? (
                    <>
                        <span className="trial-ring-number">—</span>
                        <span className="trial-ring-caption">Trial ended</span>
                    </>
                ) : (
                    <>
                        <span className="trial-ring-number">{dayNumber}</span>
                        <span className="trial-ring-caption">of {TRIAL_LENGTH_DAYS} days</span>
                    </>
                )}
            </div>
        </div>
    );
}

/** Upgrade confirmation shown after picking a paid plan. */
function UpgradeModal({ plan, daysRemaining, expired, confirmed, onConfirm, onClose }: {
    plan: UpgradePlan;
    daysRemaining: number;
    expired: boolean;
    confirmed: boolean;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <div className="upgrade-overlay" onClick={onClose}>
            <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
                <button className="upgrade-close" onClick={onClose} aria-label="Close">×</button>

                {confirmed ? (
                    <div className="upgrade-confirmed">
                        <div className="upgrade-check">✓</div>
                        <h2>You're on the list for {plan.name}</h2>
                        <p>
                            We've noted your interest in upgrading to <strong>{plan.name}</strong>.
                            You'll be the first to know when paid plans go live, and your
                            free trial carries on untouched until then.
                        </p>
                        <button className="trial-subscribe primary" onClick={onClose}>
                            Back to trial status
                        </button>
                    </div>
                ) : (
                    <>
                        <span className="upgrade-eyebrow">Upgrade</span>
                        <h2>Upgrade to {plan.name}</h2>
                        <p className="upgrade-sub">{plan.tagline}</p>

                        <div className="upgrade-price-row">
                            <div>
                                <strong>{plan.price}</strong>
                                <span>{plan.period}</span>
                            </div>
                            <span className="upgrade-from">
                                {expired ? "from Free (trial ended)" : "upgrading from Free"}
                            </span>
                        </div>

                        <p className="upgrade-unlock-label">What you unlock</p>
                        <ul className="upgrade-benefits">
                            {plan.benefits.map(b => <li key={b}>{b}</li>)}
                        </ul>

                        <div className="upgrade-notice">
                            <strong>Payment processing isn't live yet.</strong>{" "}
                            {expired
                                ? "Register your interest and we'll contact you the moment paid plans open."
                                : `Register your interest now — your ${daysRemaining}-day trial keeps running either way, and nothing is charged today.`}
                        </div>

                        <div className="upgrade-actions">
                            <button className="trial-subscribe" onClick={onClose}>
                                Stay on Free
                            </button>
                            <button className="trial-subscribe primary" onClick={onConfirm}>
                                Confirm upgrade to {plan.name}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function TrialStatusPage({ onNavigate }: Props) {
    const trial = getTrialState();
    const user = getStoredUser();
    const [selectedPlan, setSelectedPlan] = useState<UpgradePlan | null>(null);
    const [interested, setInterested] = useState<string | null>(null);

    return (
        <div className="page-container trial-status-page">
            <button className="trial-back" onClick={() => onNavigate("pricing")}>
                ← Back to plans
            </button>

            <div className="trial-panel">
                <TrialRing
                    percentElapsed={trial.percentElapsed}
                    dayNumber={trial.dayNumber}
                    expired={trial.expired}
                />

                <div className="trial-panel-body">
                    <span className={`trial-state-pill ${trial.expired ? "ended" : "active"}`}>
                        {trial.expired ? "Trial ended" : "Trial active"}
                    </span>

                    <h1>
                        {trial.expired
                            ? "Your free trial has ended"
                            : trial.daysRemaining === 1
                                ? "1 day remaining"
                                : `${trial.daysRemaining} days remaining`}
                    </h1>

                    <p className="trial-panel-sub">
                        {trial.expired ? (
                            <>
                                Your {TRIAL_LENGTH_DAYS}-day trial ran until {trial.endDateLabel}.
                                Choose a plan below to keep full access.
                            </>
                        ) : (
                            <>
                                {user.fullName ? `${user.fullName}, you're` : "You're"} on the Free plan —
                                day {trial.dayNumber} of your {TRIAL_LENGTH_DAYS}-day trial.
                                Full access continues until <strong>{trial.endDateLabel}</strong>.
                            </>
                        )}
                    </p>

                    <div className="trial-progress-track">
                        <div
                            className={`trial-progress-fill ${trial.expired ? "ended" : ""}`}
                            style={{ width: `${trial.expired ? 100 : trial.percentElapsed}%` }}
                        />
                    </div>
                    <div className="trial-progress-legend">
                        <span>Day 1</span>
                        <span>Day {TRIAL_LENGTH_DAYS}</span>
                    </div>
                </div>
            </div>

            <div className="trial-columns">
                <section className="trial-includes">
                    <h2>Included in your trial</h2>
                    <ul>
                        {TRIAL_INCLUDES.map(item => (
                            <li key={item}><span className="trial-tick">✓</span>{item}</li>
                        ))}
                    </ul>
                    <p className="trial-includes-note">
                        Nothing is locked during the trial — every Free-tier feature is available today.
                    </p>
                </section>

                <section className="trial-upgrade">
                    <h2>Continue with a paid plan</h2>
                    <p className="trial-upgrade-sub">
                        Keep your analyses and unlock the features built for ongoing lab work.
                    </p>

                    <div className="trial-plan-grid">
                        {UPGRADE_PLANS.map(plan => (
                            <div
                                key={plan.name}
                                className={`trial-plan-card ${plan.highlight ? "highlight" : ""}`}
                            >
                                {plan.highlight && <span className="trial-plan-badge">Recommended</span>}
                                <h3>{plan.name}</h3>
                                <div className="trial-plan-price">
                                    <strong>{plan.price}</strong>
                                    <span>{plan.period}</span>
                                </div>
                                <p className="trial-plan-tagline">{plan.tagline}</p>
                                <ul>
                                    {plan.benefits.map(b => <li key={b}>{b}</li>)}
                                </ul>
                                <button
                                    className={`trial-subscribe ${plan.highlight ? "primary" : ""} ${interested === plan.name ? "done" : ""}`}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    {interested === plan.name
                                        ? "✓ Upgrade requested"
                                        : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="trial-enterprise">
                        <div>
                            <h3>Enterprise</h3>
                            <p>API access, on-premise deployment, and custom solvent data integration.</p>
                        </div>
                        <button
                            className={`trial-subscribe ${interested === "Enterprise" ? "done" : ""}`}
                            onClick={() => setSelectedPlan(ENTERPRISE_PLAN)}
                        >
                            {interested === "Enterprise" ? "✓ Upgrade requested" : "Contact sales"}
                        </button>
                    </div>
                </section>
            </div>

            {interested && (
                <p className="trial-interest-note">
                    Your upgrade request for the <strong>{interested}</strong> plan has been recorded.
                    Payment processing goes live in a future release; your trial is unaffected.
                </p>
            )}

            <p className="pricing-footnote">
                Payment processing is planned for a future release. All features are currently free for academic use.
            </p>

            {selectedPlan && (
                <UpgradeModal
                    plan={selectedPlan}
                    daysRemaining={trial.daysRemaining}
                    expired={trial.expired}
                    confirmed={interested === selectedPlan.name}
                    onConfirm={() => setInterested(selectedPlan.name)}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </div>
    );
}
