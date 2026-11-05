export interface ActionState {
  status: "idle" | "invalid" | "limited" | "unavailable";
  message: string;
  fieldErrors: Readonly<Record<string, string>>;
}

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
