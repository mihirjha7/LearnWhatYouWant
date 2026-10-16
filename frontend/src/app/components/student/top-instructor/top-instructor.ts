



import { Component, inject, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopInstructorDto } from '../../../models/student.model';
import { RuntimeConfigService } from '../../../core/config/runtime-config';

@Component({
    selector: 'app-top-instructors',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, DecimalPipe],
   templateUrl: './top-instructor.html',
    styleUrl: './top-instructor.css'
})

export class TopInstructorsComponent {
    @Input() instructors: TopInstructorDto[] = []; 
    @Input() isLoading: boolean = true; 

    private config = inject(RuntimeConfigService);

    getInstructorProfile(instructor: TopInstructorDto): string | null {
        return this.config.uploadUrl(instructor.profilePicture);
    }

    getInitial(name: string): string {
        return name.trim().charAt(0).toUpperCase() || 'I';
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).hidden = true;
    }
}