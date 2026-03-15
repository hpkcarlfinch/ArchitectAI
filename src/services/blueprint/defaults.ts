import type { BlueprintSchema } from "../../types/blueprint";

export const fallbackBlueprint: BlueprintSchema = {
  metadata: {
    title: "Starter Home",
    description: "Simple fallback floor plan",
    style: "minimal",
    units: "m",
  },
  floors: [
    {
      id: "floor_0",
      level: 0,
      name: "Ground Floor",
      ceilingHeight: 2.8,
      rooms: [
        {
          id: "room_living",
          name: "Living Room",
          polygon: [
            { x: 0, y: 0 },
            { x: 6, y: 0 },
            { x: 6, y: 4 },
            { x: 0, y: 4 },
          ],
        },
        {
          id: "room_kitchen",
          name: "Kitchen",
          polygon: [
            { x: 6, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 4 },
            { x: 6, y: 4 },
          ],
        },
      ],
      walls: [
        { id: "w1", start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, thickness: 0.2, type: "exterior" },
        { id: "w2", start: { x: 10, y: 0 }, end: { x: 10, y: 4 }, thickness: 0.2, type: "exterior" },
        { id: "w3", start: { x: 10, y: 4 }, end: { x: 0, y: 4 }, thickness: 0.2, type: "exterior" },
        { id: "w4", start: { x: 0, y: 4 }, end: { x: 0, y: 0 }, thickness: 0.2, type: "exterior" },
        { id: "w5", start: { x: 6, y: 0 }, end: { x: 6, y: 4 }, thickness: 0.15, type: "interior" },
      ],
      doors: [{ id: "d1", wallId: "w1", offset: 4.2, width: 1, height: 2.1 }],
      windows: [{ id: "win1", wallId: "w3", offset: 3, width: 1.5, sillHeight: 0.9, height: 1.2 }],
    },
  ],
};
