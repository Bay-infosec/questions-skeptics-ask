import {
  ArrowLeft,
  ArrowRight,
  MessageSquareText,
  Presentation,
  Users,
} from "lucide-react";
import Brand from "../components/Brand";

const views = [
  {
    href: "?view=projector",
    icon: Presentation,
    label: "Room display",
    title: "Projector",
    description: "Show the participant QR code and live poll results on the main screen.",
  },
  {
    href: "?view=moderator",
    icon: MessageSquareText,
    label: "Workshop control",
    title: "Moderator",
    description: "Review anonymous questions, highlight themes, and monitor next steps.",
  },
  {
    href: "?view=leader",
    icon: Users,
    label: "Private follow-up",
    title: "Group Leader",
    description: "Open the responses assigned to your conversation group.",
  },
];

export default function OrganizerHub() {
  return (
    <main className="organizer shell shell--wide">
      <header className="organizer__header">
        <Brand />
        <a className="back-link" href="/">
          <ArrowLeft size={16} /> Participant page
        </a>
      </header>

      <section className="organizer__intro">
        <p className="eyebrow">Workshop team</p>
        <h1>Organizer access</h1>
        <p>
          Choose the view you need. Each dashboard remains protected by its
          workshop access code.
        </p>
      </section>

      <section className="organizer__grid" aria-label="Organizer views">
        {views.map(({ href, icon: Icon, label, title, description }) => (
          <a className="organizer-card" href={href} key={href}>
            <span className="organizer-card__icon"><Icon size={25} /></span>
            <span className="eyebrow">{label}</span>
            <strong>{title}</strong>
            <span className="organizer-card__description">{description}</span>
            <span className="organizer-card__action">
              Open view <ArrowRight size={17} />
            </span>
          </a>
        ))}
      </section>

      <aside className="organizer__note">
        Participants do not need an access code. Share the main page or printed
        QR poster with them.
      </aside>
    </main>
  );
}
