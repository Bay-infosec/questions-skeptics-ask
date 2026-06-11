import { describe, expect, it } from "vitest";
import { requiresContact, validateFollowup } from "./validation";

describe("follow-up validation", () => {
  it("requires contact details when contact is requested", () => {
    expect(requiresContact(["I'd like someone to contact me."])).toBe(true);
    expect(
      validateFollowup({
        nextSteps: ["I'd like someone to contact me."],
        spiritualInterest: "I'm unsure.",
        phone: "",
        instagram: "",
        email: "",
        preferredContact: "",
      }).contact,
    ).toBeTruthy();
  });

  it("accepts an anonymous response without a contact request", () => {
    expect(
      validateFollowup({
        nextSteps: ["I'm not ready yet."],
        spiritualInterest: "I'm unsure.",
        phone: "",
        instagram: "",
        email: "",
        preferredContact: "",
      }),
    ).toEqual({});
  });
});
