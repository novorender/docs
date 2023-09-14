import React from "react";
import Link from "@docusaurus/Link";

const gradients = [
    "linear-gradient(140deg, #8e2de2, #4a00e0)",
    "linear-gradient(140deg, #ee0979, #ff6a00)",
    "linear-gradient(140deg, #ec008c, #fc6767)"
];

export default function ActionCard({ cards }: { cards: Array<{ title: string; description: string; actionLabel: string; link: string; }>; }): JSX.Element {
    return (<div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        {cards.map((c, i) => (<div key={i} style={{ width: 300 }}>
            <div className="card" style={{ background: gradients[i] }}>
                <div className="card__header">
                    <h3>{c.title}</h3>
                </div>
                <div style={{ fontSize: 14 }} className="card__body">
                    <p>{c.description}</p>
                </div>
                <div className="card__footer">
                    <Link className="button button--secondary button--block" to={c.link}>{c.actionLabel}</Link>
                </div>
            </div>
        </div>))}
    </div>);
}
