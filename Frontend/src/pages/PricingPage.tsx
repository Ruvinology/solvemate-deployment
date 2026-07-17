import "../styles/pricing.css";

const TIERS = [
    {
        name: "Free",
        price: "$0",
        period: "/ 14-day free trial",
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
        price: "Rs. 2,990",
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
        price: "Rs. 16,490",
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

export default function PricingPage() {
    return (
        <div className="page-container pricing-page">
            <div className="pricing-hero">
                <span className="pricing-hero-tag">Pricing</span>
                <h1>Plans for every stage of your research</h1>
                <p>
                    SolveMate is free to use today. Paid tiers below outline our planned
                    roadmap as the platform grows — payment integration is not yet live.
                </p>
            </div>

            <div className="pricing-grid">
                {TIERS.map(tier => (
                    <div key={tier.name} className={`pricing-card ${tier.highlight ? "highlight" : ""}`}>
                        {tier.highlight && <span className="pricing-badge">Most Popular</span>}
                        <h3>{tier.name}</h3>
                        <div className="pricing-amount">
                            <span className="pricing-price">{tier.price}</span>
                            {tier.period && <span className="pricing-period">{tier.period}</span>}
                        </div>
                        <p className="pricing-tagline">{tier.tagline}</p>
                        <ul className="pricing-features">
                            {tier.features.map(f => <li key={f}>✓ {f}</li>)}
                        </ul>
                        <button className={`pricing-cta ${tier.highlight ? "primary" : ""}`} disabled={tier.name !== "Free"}>
                            {tier.cta}
                        </button>
                    </div>
                ))}
            </div>

            <p className="pricing-footnote">
                Payment processing is planned for a future release. All features are currently free for academic use.
            </p>
        </div>
    );
}