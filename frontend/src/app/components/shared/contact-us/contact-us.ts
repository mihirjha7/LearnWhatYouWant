import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css']
})
export class ContactUs {
  // Simple template-driven form model
  model = {
    name: '',
    email: '',
    message: ''
  };

  isSending = false;
  sent = false;
  error = '';

  onSubmit() {
    this.error = '';
    if (!this.model.name || !this.model.email || !this.model.message) {
      this.error = 'Please fill all the fields.';
      return;
    }

    // Simulate sending
    this.isSending = true;
    setTimeout(() => {
      this.isSending = false;
      this.sent = true;
      this.model = { name: '', email: '', message: '' };
    }, 800);
  }
}