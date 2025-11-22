import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.scss'
})
export class JsonViewerComponent {
  private readonly inputValue = signal<unknown>(undefined);
  private readonly sanitizer = inject(DomSanitizer);

  @Input() label = 'JSON';
  @Input() emptyState = 'No data to display.';

  @Input()
  set value(value: unknown) {
    this.inputValue.set(value);
  }

  protected readonly formatted = computed(() => this.stringify(this.inputValue()));
  protected readonly formattedHtml = computed(() => this.formatJsonWithBoldKeys(this.inputValue()));

  async copyToClipboard(): Promise<void> {
    const content = this.formatted();
    if (!content) {
      return;
    }

    await navigator.clipboard.writeText(content);
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  private formatJsonWithBoldKeys(value: unknown): SafeHtml {
    if (value === null || value === undefined) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    if (typeof value === 'string') {
      // If it's already a string, try to parse it as JSON first
      const stringValue = value;
      try {
        value = JSON.parse(stringValue);
      } catch {
        // If parsing fails, return as plain text
        return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(stringValue));
      }
    }

    try {
      const jsonString = JSON.stringify(value, null, 2);
      // Format JSON with bold keys using regex
      // Match keys in JSON format: "key": 
      const formatted = jsonString.replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:');
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(String(value)));
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

