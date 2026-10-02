import type { RatingResponse } from "@core/api";

function isRatingResponse(value: unknown): value is RatingResponse {
  const rating = value as RatingResponse;
  return !!rating && Number.isInteger(rating.ratingCount) && rating.ratingCount >= 0 &&
    (rating.ratingValue === null || (typeof rating.ratingValue === "number" && rating.ratingValue >= 1 && rating.ratingValue <= 5)) &&
    (rating.myRating === null || (Number.isInteger(rating.myRating) && rating.myRating >= 1 && rating.myRating <= 5));
}

export function formatRatingSummary(value: number | null, count: number, labels: { empty: string; singular: string; plural: string }): string {
  if (value === null || count === 0) return labels.empty;
  return `${value.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5 · ${count} ${count === 1 ? labels.singular : labels.plural}`;
}

export function mountRating(surface: HTMLElement): void {
  const { apiUrl, articleId, ratingEmpty, ratingSingular, ratingPlural, ratingLoadError, ratingSaveError, ratingThanks } = surface.dataset;
  if (!apiUrl || !articleId || !ratingEmpty || !ratingSingular || !ratingPlural || !ratingLoadError || !ratingSaveError || !ratingThanks) return;
  const endpoint = new URL(`/v1/articles/${encodeURIComponent(articleId)}/rating`, apiUrl).href;
  const fieldset = surface.querySelector<HTMLFieldSetElement>("fieldset");
  const summary = surface.querySelector<HTMLElement>("[data-rating-summary]");
  const mine = surface.querySelector<HTMLElement>("[data-rating-mine]");
  const status = surface.querySelector<HTMLElement>("[data-rating-status]");
  if (!fieldset || !summary || !mine || !status) return;
  let rating: RatingResponse | null = null;
  const render = () => {
    summary.textContent = formatRatingSummary(rating?.ratingValue ?? null, rating?.ratingCount ?? 0, { empty: ratingEmpty, singular: ratingSingular, plural: ratingPlural });
    mine.textContent = rating?.myRating === null || rating?.myRating === undefined ? "" : `Twoja ocena: ${rating.myRating} / 5`;
    surface.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => { input.checked = input.value === String(rating?.myRating); });
  };
  const load = async () => {
    try {
      const response = await fetch(endpoint, { credentials: "include" });
      const payload: unknown = await response.json();
      if (!response.ok || !isRatingResponse(payload)) throw new Error("Rating unavailable");
      rating = payload; render(); fieldset.disabled = false; status.textContent = "";
    } catch { status.textContent = ratingLoadError; fieldset.disabled = false; }
  };
  fieldset.addEventListener("change", (event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('input[type="radio"]');
    const value = Number(input?.value); if (!input || !Number.isInteger(value) || value < 1 || value > 5 || fieldset.disabled) return;
    fieldset.disabled = true; status.textContent = "";
    void fetch(endpoint, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) })
      .then(async (response) => {
        const payload: unknown = await response.json(); if (!response.ok || !isRatingResponse(payload)) throw new Error("Rating rejected");
        rating = payload; render(); status.textContent = ratingThanks;
      }).catch(() => { render(); status.textContent = ratingSaveError; })
      .finally(() => { fieldset.disabled = false; });
  });
  void load();
}
