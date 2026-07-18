import { useMemo, useState } from "react";

import Card from "./Card";

import {
  CARD_HEIGHT,
  PEEK_HEIGHT,
  CARD_GAP,
} from "./cardStyles";

import {
  getCardTop,
  getCardZIndex,
  getStackHeight,
} from "./utils";

export default function StackCards({
  cards = [],
}) {
  const [active, setActive] = useState(0);

  const height = useMemo(
    () => getStackHeight(cards.length),
    [cards.length]
  );

  return (
    <div
      style={{
        position: "relative",
        height,
        width: "100%",
      }}
    >
      {cards.map((card, index) => {
        const isActive = index === active;

        return (
          <Card
            key={index}
            card={card}
            index={index}
            active={isActive}
            onClick={() => {
              setActive(index);

              if (
                isActive &&
                typeof card.onClick === "function"
              ) {
                card.onClick();
              }
            }}
            style={{
              top: getCardTop(index, active),

              zIndex: getCardZIndex(
                index,
                active,
                cards.length
              ),

              transform: isActive
                ? "scale(1)"
                : "scale(.985)",

              pointerEvents: "auto",
            }}
          />
        );
      })}

      {/* espace afin de toujours voir la dernière carte */}
      <div
        style={{
          position: "absolute",
          top:
            CARD_HEIGHT +
            (cards.length - 1) *
              PEEK_HEIGHT +
            CARD_GAP,
          height: 40,
          width: 1,
        }}
      />
    </div>
  );
}