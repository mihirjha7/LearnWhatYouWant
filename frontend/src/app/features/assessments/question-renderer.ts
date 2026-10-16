import { Component, computed, input, output } from '@angular/core';
import { AssessmentQuestion, ResponseValue } from '../../data-access/contracts/assessment.contracts';

@Component({
  selector: 'app-question-renderer',
  standalone: true,
  template: `
    @let q = question();
    <fieldset class="ws-stack" style="border: 0; margin: 0; padding: 0">
      <legend class="sr-only">{{ q.prompt }}</legend>
      @switch (q.type) {
        @case ('multiple') {
          <p class="ws-muted ws-small">Select all that apply.</p>
          @for (option of q.options ?? []; track option.id) {
            <label class="ws-option"><input type="checkbox" [checked]="selectedMany().includes(option.id)" (change)="toggleMany(option.id)" /><span>{{ option.label }}</span></label>
          }
        }
        @case ('matching') {
          <p class="ws-muted ws-small">Choose the matching description for each item.</p>
          @for (left of q.matchLeft ?? []; track left.id) {
            <label class="ws-field">
              <span>{{ left.label }}</span>
              <select [value]="matches()[left.id] || ''" (change)="setMatch(left.id, $any($event.target).value)">
                <option value="">Select a match</option>
                @for (right of q.matchRight ?? []; track right.id) { <option [value]="right.id">{{ right.label }}</option> }
              </select>
            </label>
          }
        }
        @case ('ordering') {
          <p class="ws-muted ws-small">Use the move buttons to arrange the items. Position changes are announced.</p>
          <ol class="ws-list" style="padding: 0">
            @for (item of orderedItems(); track item.id; let index = $index, last = $last) {
              <li class="ws-card" style="padding: 0.75rem 1rem; margin-bottom: 0.5rem; display: flex; flex-direction: row">
                <span class="ws-item__body"><strong>{{ index + 1 }}. {{ item.label }}</strong></span>
                <span class="ws-row-flex">
                  <button type="button" class="button button--sm" [disabled]="index === 0" (click)="move(index, -1)" [attr.aria-label]="'Move ' + item.label + ' up'">Up</button>
                  <button type="button" class="button button--sm" [disabled]="last" (click)="move(index, 1)" [attr.aria-label]="'Move ' + item.label + ' down'">Down</button>
                </span>
              </li>
            }
          </ol>
          <p class="sr-only" aria-live="polite">{{ orderAnnouncement }}</p>
        }
        @case ('fill-blank') {
          <label class="ws-field"><span>Your answer</span><input type="text" [value]="text()" [placeholder]="q.placeholder ?? ''" (input)="emit($any($event.target).value)" autocomplete="off" /></label>
        }
        @case ('short-answer') {
          <label class="ws-field"><span>Your response</span><input type="text" maxlength="400" [value]="text()" (input)="emit($any($event.target).value)" /><small>{{ text().length }}/400 characters</small></label>
        }
        @case ('essay') {
          <label class="ws-field"><span>Your essay</span><textarea rows="12" [value]="text()" (input)="emit($any($event.target).value)"></textarea><small>{{ wordCount() }} words</small></label>
        }
        @case ('code') {
          <label class="ws-field"><span>{{ q.language }} solution</span><textarea class="ws-code" rows="14" spellcheck="false" autocapitalize="off" [value]="text() || q.starterCode || ''" (input)="emit($any($event.target).value)"></textarea><small>Code is evaluated on the server after submission. Use Esc then Tab to move focus out of the editor.</small></label>
        }
        @case ('file') {
          <label class="ws-field"><span>Upload file</span><input type="file" [accept]="q.acceptedFileTypes ?? ''" (change)="selectFile($event)" /><small>Accepted: {{ q.acceptedFileTypes }} · up to {{ q.maxFileSizeMb }} MB. Files are scanned before instructors can open them.</small></label>
          @if (fileError) { <p class="ws-banner ws-banner--danger" role="alert">{{ fileError }}</p> }
          @if (text()) { <p class="ws-banner"><strong>Selected:</strong> {{ text() }} <span class="status status--warning">Scan pending</span></p> }
        }
        @default {
          @for (option of q.options ?? []; track option.id) {
            <label class="ws-option"><input type="radio" [name]="'q-' + q.id" [checked]="text() === option.id" (change)="emit(option.id)" /><span>{{ option.label }}</span></label>
          }
        }
      }
    </fieldset>
  `,
})
export class QuestionRendererComponent {
  readonly question = input.required<AssessmentQuestion>();
  readonly value = input<ResponseValue | undefined>(null);
  readonly valueChange = output<ResponseValue>();

  protected orderAnnouncement = '';
  protected fileError = '';

  protected readonly text = computed(() => (typeof this.value() === 'string' ? (this.value() as string) : ''));
  protected readonly selectedMany = computed(() => (Array.isArray(this.value()) ? (this.value() as readonly string[]) : []));
  protected readonly matches = computed(() => {
    const value = this.value();
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Readonly<Record<string, string>>) : {};
  });
  protected readonly orderedItems = computed(() => {
    const items = this.question().orderItems ?? [];
    const order = this.selectedMany();
    return order.length === items.length ? order.map((id) => items.find((item) => item.id === id)!).filter(Boolean) : items;
  });
  protected readonly wordCount = computed(() => this.text().trim().split(/\s+/).filter(Boolean).length);

  protected emit(value: ResponseValue): void {
    this.valueChange.emit(value);
  }

  protected toggleMany(id: string): void {
    const current = this.selectedMany();
    this.emit(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  protected setMatch(leftId: string, rightId: string): void {
    const next = { ...this.matches() };
    if (rightId) next[leftId] = rightId;
    else delete next[leftId];
    this.emit(next);
  }

  protected move(index: number, offset: -1 | 1): void {
    const ids = this.orderedItems().map((item) => item.id);
    const target = index + offset;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const moved = this.orderedItems()[index];
    this.orderAnnouncement = `${moved.label} moved to position ${target + 1}.`;
    this.emit(ids);
  }

  protected selectFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.fileError = '';
    if (!file) return;
    const q = this.question();
    const allowed = (q.acceptedFileTypes ?? '').split(',').map((type) => type.trim().toLowerCase()).filter(Boolean);
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (allowed.length && !allowed.includes(extension)) {
      this.fileError = `This file type is not accepted. Use ${allowed.join(', ')}.`;
      return;
    }
    if (q.maxFileSizeMb && file.size > q.maxFileSizeMb * 1024 * 1024) {
      this.fileError = `This file is larger than ${q.maxFileSizeMb} MB.`;
      return;
    }
    this.emit(`${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`);
  }
}
