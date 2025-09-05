import type { JSX, PointerEvent } from "react";

export const ReactionSelector = ({
  setReaction,
}: {
  setReaction: (reaction: string) => void;
}): JSX.Element => (
  <div
    className="-translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white px-2"
    style={{
      boxShadow:
        "0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    }}
    onPointerMove={(e: PointerEvent<HTMLDivElement>) => e.stopPropagation()}
  >
    <ReactionButton reaction="👍" onSelect={setReaction} />
    <ReactionButton reaction="🔥" onSelect={setReaction} />
    <ReactionButton reaction="😍" onSelect={setReaction} />
    <ReactionButton reaction="👀" onSelect={setReaction} />
    <ReactionButton reaction="😱" onSelect={setReaction} />
    <ReactionButton reaction="🙁" onSelect={setReaction} />
  </div>
);

export const ReactionButton = ({
  reaction,
  onSelect,
}: {
  reaction: string;
  onSelect: (reaction: string) => void;
}): JSX.Element => (
  <button
    type="button"
    className="transform select-none p-2 text-xl transition-transform hover:scale-150 focus:scale-150 focus:outline-none"
    onPointerDown={() => onSelect(reaction)}
  >
    {reaction}
  </button>
);
