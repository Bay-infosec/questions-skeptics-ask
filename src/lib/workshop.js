import { supabase, workshopSlug } from "./supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export function getPublicWorkshop() {
  return supabase.rpc("workshop_get_public", { p_slug: workshopSlug }).then(unwrap);
}

export function submitPoll(choice, attendeeId) {
  return supabase
    .rpc("workshop_submit_poll", {
      p_slug: workshopSlug,
      p_choice: choice,
      p_attendee_id: attendeeId,
    })
    .then(unwrap);
}

export function submitQuestion(question, attendeeId) {
  return supabase
    .rpc("workshop_submit_question", {
      p_slug: workshopSlug,
      p_question: question,
      p_attendee_id: attendeeId,
    })
    .then(unwrap);
}

export function submitFollowup(payload, attendeeId) {
  return supabase
    .rpc("workshop_submit_followup", {
      p_slug: workshopSlug,
      p_attendee_id: attendeeId,
      p_next_steps: payload.nextSteps,
      p_first_name: payload.firstName || null,
      p_phone: payload.phone || null,
      p_instagram: payload.instagram || null,
      p_email: payload.email || null,
      p_preferred_contact: payload.preferredContact || null,
      p_group_id: payload.groupId || null,
      p_spiritual_interest: payload.spiritualInterest,
      p_prayer_request: payload.prayerRequest || null,
    })
    .then(unwrap);
}

export function getPollResults(accessCode) {
  return supabase
    .rpc("workshop_get_poll_results", {
      p_slug: workshopSlug,
      p_access_code: accessCode,
    })
    .then(unwrap);
}

export function getModeratorData(accessCode) {
  return supabase
    .rpc("workshop_get_moderator_data", {
      p_slug: workshopSlug,
      p_access_code: accessCode,
    })
    .then(unwrap);
}

export function updateQuestionStatus(accessCode, questionId, status) {
  return supabase
    .rpc("workshop_update_question_status", {
      p_slug: workshopSlug,
      p_access_code: accessCode,
      p_question_id: questionId,
      p_status: status,
    })
    .then(unwrap);
}

export function getLeaderData(accessCode) {
  return supabase
    .rpc("workshop_get_leader_data", {
      p_slug: workshopSlug,
      p_access_code: accessCode,
    })
    .then(unwrap);
}
