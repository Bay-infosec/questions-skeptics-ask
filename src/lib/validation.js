export function requiresContact(nextSteps) {
  return nextSteps.includes("I'd like someone to contact me.");
}

export function hasContactMethod(values) {
  return Boolean(values.phone || values.instagram || values.email);
}

export function validateFollowup(values) {
  const errors = {};
  if (!values.spiritualInterest) {
    errors.spiritualInterest = "Choose the statement that fits you best.";
  }
  if (requiresContact(values.nextSteps) && !hasContactMethod(values)) {
    errors.contact = "Add at least one way for a leader to contact you.";
  }
  if (values.preferredContact) {
    const fields = {
      Text: values.phone,
      "Instagram DM": values.instagram,
      Email: values.email,
      "Phone Call": values.phone,
    };
    if (!fields[values.preferredContact]) {
      errors.contact = `Add your ${values.preferredContact === "Instagram DM" ? "Instagram" : values.preferredContact.toLowerCase()} details.`;
    }
  }
  return errors;
}
