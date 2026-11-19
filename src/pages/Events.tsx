import { Ticket as Icon } from "lucide-react";

const Events = () => (
  <div className="board flex h-full flex-col items-center justify-center px-6 text-center">
    <div className="note note-tilt-left max-w-sm px-8 py-10">
      <div className="pin" />
      <Icon className="mx-auto mb-3 h-10 w-10" aria-hidden="true" />
      <h1 className="font-marker text-4xl">Events</h1>
      <p className="mt-2 text-lg text-muted-foreground">Pin your own event soon.</p>
      <p className="sticky-note mt-5 inline-block px-4 py-2 font-marker text-xl">Coming soon</p>
    </div>
  </div>
);

export default Events;
