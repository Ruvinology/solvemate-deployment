import { getTrialState, TRIAL_LENGTH_DAYS } from "../utils/trial";
import "../styles/pricing.css";

interface Props {
    onNavigate: (page: string) => void;
}

const TIERS = [
    {
        name: "Free",
        price: "Rs. 0",
        period: `/ ${TRIAL_LENGTH_DAYS}-day free trial`,
        tagline: "For students and individual researchers",
        features: [
            "Full 541-solvent catalog",
            "Standard compatibility analysis",
            "Green Solvent Engine",
            "Basic SHAP explanations",
            "5 AI Assistant questions / day",
        ],
        cta: "Current Plan",
        highlight: false,
    },
    {
        name: "Pro",
        price: "Rs. 579",
        period: "/ month",
        tagline: "For active researchers and small labs",
        features: [
            "Everything in Free",
            "Unlimited AI Research Assistant",
            "Exportable PDF reports",
            "Saved analysis history",
            "Bulk polymer comparison",
        ],
        cta: "Coming Soon",
        highlight: true,
    },
    {
        name: "Team",
        price: "Rs. 2,499",
        period: "/ month",
        tagline: "For research groups and small companies",
        features: [
            "Everything in Pro",
            "Multi-user accounts",
            "Admin dashboard access",
            "Shared trial history",
            "Priority support",
        ],
        cta: "Coming Soon",
        highlight: false,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        tagline: "For manufacturers and large labs",
        features: [
            "Everything in Team",
            "API access",
            "Custom / on-premise deployment",
            "Custom solvent data integration",
            "Dedicated support",
        ],
        cta: "Contact Us",
        highlight: false,
    },
];

export default function PricingPage({ onNavigate }: Props) {
    const trial = getTrialState();

    return (
        <div className="page-container pricing-page">
            <div className="pricing-hero">
                <span className="pricing-hero-tag">Pricing</span>
                <h1>Plans for every stage of your research</h1>
                <p>
                    You're currently on the Free plan. Paid tiers below outline our planned roadmap as the platform grows. Payment integration is not yet live.
                </p>
            </div>

            <div className="pricing-grid">
                {TIERS.map(tier => {
                    const isCurrent = tier.name === "Free";

                    return (
                        <div
                            key={tier.name}
                            className={`pricing-card ${tier.highlight ? "highlight" : ""} ${isCurrent ? "current" : ""}`}
                        >
                            {tier.highlight && <span className="pricing-badge">Most Popular</span>}
                            {isCurrent && (
                                <span className={`pricing-badge current-badge ${trial.expired ? "ended" : ""}`}>
                                    {trial.expired ? "Trial Ended" : "Your Plan"}
                                </span>
                            )}

                            <h3>{tier.name}</h3>
                            <div className="pricing-amount">
                                <span className="pricing-price">{tier.price}</span>
                                {tier.period && <span className="pricing-period">{tier.period}</span>}
                            </div>
                            <p className="pricing-tagline">{tier.tagline}</p>

                            {isCurrent && (
                                <div className="pricing-trial-status">
                                    <div className="pricing-trial-line">
                                        <span className="pricing-trial-day">
                                            {trial.expired
                                                ? "Trial ended"
                                                : `Day ${trial.dayNumber} of ${TRIAL_LENGTH_DAYS}`}
                                        </span>
                                        <span className="pricing-trial-left">
                                            {trial.expired
                                                ? trial.endDateLabel
                                                : trial.daysRemaining === 1
                                                    ? "1 day left"
                                                    : `${trial.daysRemaining} days left`}
                                        </span>
                                    </div>
                                    <div className="pricing-trial-track">
                                        <div
                                            className={`pricing-trial-fill ${trial.expired ? "ended" : ""}`}
                                            style={{ width: `${trial.expired ? 100 : trial.percentElapsed}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <ul className="pricing-features">
                                {tier.features.map(f => <li key={f}>✓ {f}</li>)}
                            </ul>

                            <button
                                className={`pricing-cta ${tier.highlight ? "primary" : ""} ${isCurrent ? "active-plan" : ""}`}
                                disabled={!isCurrent}
                                onClick={isCurrent ? () => onNavigate("trial-status") : undefined}
                            >
                                {isCurrent
                                    ? (trial.expired ? "View plans →" : "View trial status →")
                                    : tier.cta}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="pricing-footnote">
                Payment processing is planned for a future release. All features are currently free for academic use.
            </p>
        </div>
    );
}
