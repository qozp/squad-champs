import HelpHeader from "~/components/help/HelpHeader";
import HelpTabs from "~/components/help/HelpTabs";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 flex flex-col">
      <HelpHeader />
      <HelpTabs />
    </div>
  );
}
