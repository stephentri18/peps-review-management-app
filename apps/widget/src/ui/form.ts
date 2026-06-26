import type { WidgetConfig, UploadedMedia } from '../types.js';
import { submitReview } from '../api.js';
import { uploadFile } from '../upload.js';
import { createInteractiveStars } from './stars.js';

interface FormState {
  open: boolean;
  rating: number;
  name: string;
  email: string;
  title: string;
  body: string;
  media: UploadedMedia[];
  uploading: boolean;
  uploadProgress: number;
  submitting: boolean;
  submitted: boolean;
  submitError: string | null;
  errors: Partial<Record<'rating' | 'name' | 'email' | 'body', string>>;
}

export function createReviewForm(
  config: WidgetConfig,
  onSubmitted: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'rv-form-trigger';

  const state: FormState = {
    open: false,
    rating: 0,
    name: '', email: '', title: '', body: '',
    media: [],
    uploading: false, uploadProgress: 0,
    submitting: false, submitted: false,
    submitError: null, errors: {},
  };

  function validate(): boolean {
    state.errors = {};
    if (state.rating === 0) state.errors.rating = 'Please select a rating.';
    if (!state.name.trim()) state.errors.name = 'Name is required.';
    if (config.requireEmail && !state.email.trim()) {
      state.errors.email = 'Email is required.';
    } else if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      state.errors.email = 'Enter a valid email address.';
    }
    if (state.body.trim().length < 10) {
      state.errors.body = 'Review must be at least 10 characters.';
    }
    return Object.keys(state.errors).length === 0;
  }

  function render() {
    container.innerHTML = '';

    // ── Trigger button (when form is closed) ────────────────────────
    if (!state.open) {
      const btn = document.createElement('button');
      btn.className = 'rv-btn rv-btn--primary';
      btn.textContent = '✏️  Write a Review';
      btn.addEventListener('click', () => { state.open = true; render(); });
      container.appendChild(btn);
      return;
    }

    // ── Success screen ──────────────────────────────────────────────
    if (state.submitted) {
      container.innerHTML = `
        <div class="rv-form">
          <div class="rv-form__success">
            <div class="rv-form__success-icon">🎉</div>
            <div class="rv-form__success-title">Thank you for your review!</div>
            <div class="rv-form__success-text">
              Your review has been submitted and is pending approval.
            </div>
          </div>
        </div>
      `;
      return;
    }

    // ── Form ────────────────────────────────────────────────────────
    const form = document.createElement('div');
    form.className = 'rv-form';
    form.innerHTML = `<div class="rv-form__title">Write a Review</div>`;

    // Error banner
    if (state.submitError) {
      form.insertAdjacentHTML('beforeend', `
        <div class="rv-form__error-banner">${state.submitError}</div>
      `);
    }

    // Rating
    const ratingGroup = document.createElement('div');
    ratingGroup.className = 'rv-form__group';
    ratingGroup.innerHTML = `
      <label class="rv-form__label">Rating <span>*</span></label>
    `;
    const stars = createInteractiveStars(state.rating, (r) => {
      state.rating = r;
      // Update error state without full re-render
      const errEl = ratingGroup.querySelector<HTMLElement>('.rv-form__field-error');
      if (errEl) errEl.remove();
    });
    ratingGroup.appendChild(stars);
    if (state.errors.rating) {
      const err = document.createElement('div');
      err.className = 'rv-form__field-error';
      err.textContent = state.errors.rating;
      ratingGroup.appendChild(err);
    }
    form.appendChild(ratingGroup);

    // Name + Email row
    const nameEmailRow = document.createElement('div');
    nameEmailRow.className = 'rv-form__row';

    const nameGroup = makeInputGroup({
      label: 'Your Name', required: true, type: 'text',
      value: state.name, error: state.errors.name,
      placeholder: 'Jane D.',
      onChange: (v) => { state.name = v; },
    });
    nameEmailRow.appendChild(nameGroup);

    const emailGroup = makeInputGroup({
      label: 'Email', required: config.requireEmail, type: 'email',
      value: state.email, error: state.errors.email,
      placeholder: 'jane@example.com',
      onChange: (v) => { state.email = v; },
    });
    nameEmailRow.appendChild(emailGroup);
    form.appendChild(nameEmailRow);

    // Title (optional)
    form.appendChild(makeInputGroup({
      label: 'Review Title', required: false, type: 'text',
      value: state.title, placeholder: 'Summarize your experience',
      onChange: (v) => { state.title = v; },
    }));

    // Body
    const bodyGroup = document.createElement('div');
    bodyGroup.className = 'rv-form__group';
    bodyGroup.innerHTML = `
      <label class="rv-form__label">Your Review <span>*</span></label>
    `;
    const textarea = document.createElement('textarea');
    textarea.className = 'rv-form__textarea';
    textarea.placeholder = 'Tell us what you think...';
    textarea.value = state.body;
    textarea.addEventListener('input', () => { state.body = textarea.value; });
    bodyGroup.appendChild(textarea);
    if (state.errors.body) {
      const err = document.createElement('div');
      err.className = 'rv-form__field-error';
      err.textContent = state.errors.body;
      bodyGroup.appendChild(err);
    }
    form.appendChild(bodyGroup);

    // Media upload
    if (config.maxMedia > 0) {
      form.appendChild(createUploadSection(state, config, render));
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'rv-form__actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'rv-btn rv-btn--ghost';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => { state.open = false; render(); });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'rv-btn rv-btn--primary';
    submitBtn.textContent = state.submitting ? 'Submitting...' : 'Submit Review';
    submitBtn.disabled = state.submitting || state.uploading;

    submitBtn.addEventListener('click', async () => {
      if (!validate()) { render(); return; }

      state.submitting = true;
      state.submitError = null;
      render();

      try {
        await submitReview(config, {
          reviewer_name:  state.name.trim(),
          reviewer_email: state.email.trim(),
          rating: state.rating,
          title: state.title.trim() || undefined,
          body: state.body.trim(),
          media: state.media.length ? state.media : undefined,
        });
        state.submitted = true;
        onSubmitted();
      } catch (err) {
        state.submitError = err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
        state.submitting = false;
      }

      render();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    form.appendChild(actions);

    container.appendChild(form);
  }

  render();
  return container;
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeInputGroup(opts: {
  label: string;
  required: boolean;
  type: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
}): HTMLElement {
  const group = document.createElement('div');
  group.className = 'rv-form__group';

  const label = document.createElement('label');
  label.className = 'rv-form__label';
  label.innerHTML = opts.required
    ? `${opts.label} <span>*</span>`
    : opts.label;
  group.appendChild(label);

  const input = document.createElement('input');
  input.className = 'rv-form__input';
  input.type = opts.type;
  input.value = opts.value;
  if (opts.placeholder) input.placeholder = opts.placeholder;
  input.addEventListener('input', () => opts.onChange(input.value));
  group.appendChild(input);

  if (opts.error) {
    const err = document.createElement('div');
    err.className = 'rv-form__field-error';
    err.textContent = opts.error;
    group.appendChild(err);
  }

  return group;
}

function createUploadSection(
  state: FormState,
  config: WidgetConfig,
  rerender: () => void
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'rv-form__group';
  group.innerHTML = `
    <label class="rv-form__label">
      Photos${config.allowVideo ? ' / Videos' : ''}
    </label>
  `;

  const btnRow = document.createElement('div');
  btnRow.className = 'rv-upload__btn-row';

  // File input — zero-dimension positioned, triggered via label (works in Shadow DOM)
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.accept = config.allowVideo ? 'image/*,video/*' : 'image/*';
fileInput.style.cssText = 'position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;';

const triggerLabel = document.createElement('label');
triggerLabel.className = 'rv-upload__trigger';
triggerLabel.innerHTML = `📎 Add ${config.allowVideo ? 'Media' : 'Photos'}`;

const isDisabled = state.media.length >= config.maxMedia || state.uploading;
if (isDisabled) {
  triggerLabel.style.opacity = '0.5';
  triggerLabel.style.pointerEvents = 'none';
  triggerLabel.style.cursor = 'not-allowed';
}

// Label wraps the input — clicking label opens file picker natively
triggerLabel.appendChild(fileInput);

const hint = document.createElement('span');
hint.className = 'rv-upload__hint';
hint.textContent = `Up to ${config.maxMedia} file${config.maxMedia !== 1 ? 's' : ''}`;

btnRow.appendChild(triggerLabel);
btnRow.appendChild(hint);
  group.appendChild(btnRow);

  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'rv-upload__progress-bar';
  progressBar.style.display = 'none';
  const progressFill = document.createElement('div');
  progressFill.className = 'rv-upload__progress-fill';
  progressFill.style.width = '0%';
  progressBar.appendChild(progressFill);
  group.appendChild(progressBar);

  // Previews
  const previews = document.createElement('div');
  previews.className = 'rv-upload__previews';

  const renderPreviews = () => {
    previews.innerHTML = '';
    state.media.forEach((m, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'rv-upload__preview';

      if (m.type === 'image') {
        const img = document.createElement('img');
        img.src = m.url;
        img.alt = 'Preview';
        thumb.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = m.thumbnail_url ?? m.url;
        vid.muted = true;
        thumb.appendChild(vid);
      }

      const removeBtn = document.createElement('button');
      removeBtn.className = 'rv-upload__remove';
      removeBtn.innerHTML = '✕';
      removeBtn.setAttribute('aria-label', 'Remove file');
      removeBtn.addEventListener('click', () => {
        state.media.splice(index, 1);
        renderPreviews();
        const disabled = state.media.length >= config.maxMedia;
triggerLabel.style.opacity = disabled ? '0.5' : '1';
triggerLabel.style.pointerEvents = disabled ? 'none' : 'auto';
      });

      thumb.appendChild(removeBtn);
      previews.appendChild(thumb);
    });
  };

  group.appendChild(previews);
  renderPreviews();

  // Handle file selection
  fileInput.addEventListener('change', async () => {
    const files = Array.from(fileInput.files ?? []).slice(
      0,
      config.maxMedia - state.media.length
    );
    if (!files.length) return;

    fileInput.value = '';
    state.uploading = true;
    progressBar.style.display = 'block';
    const disabled = state.media.length >= config.maxMedia;
triggerLabel.style.opacity = disabled ? '0.5' : '1';
triggerLabel.style.pointerEvents = disabled ? 'none' : 'auto';
    rerender();

    for (const file of files) {
      try {
        const uploaded = await uploadFile(file, config, (pct) => {
          progressFill.style.width = `${pct}%`;
        });
        state.media.push(uploaded);
        renderPreviews();
      } catch {
        // silent — could show per-file error here
      }
    }

    state.uploading = false;
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    rerender();
  });

  return group;
}