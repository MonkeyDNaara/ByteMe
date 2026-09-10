import z from "zod";

export const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  short_description: z.string(),
  time: z.number(),
  incredients: z.array(z.string()),
  labels: z.array(z.string()),
  img_url: z.string(),
  likes: z.number(),
});

export type Recipe = z.infer<typeof Recipe>;

export type MealType = "Breakfast" | "Lunch" | "Dinner";
