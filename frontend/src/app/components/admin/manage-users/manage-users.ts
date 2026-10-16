// src/app/components/admin/manage-users/manage-users.component.ts
import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/interfaces';
import { AdminService } from '../../../services/admin-service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog'; // Adjust path


@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule,
  ],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css'],
})
export class ManageUsers implements OnInit, AfterViewInit {
  adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  isLoading = true;
  allUsers: User[] = [];

  // --- MatTable Properties ---
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  // --- End MatTable ---

  searchTerm: string = '';
  statusFilter: string = 'all';
  roleFilter: string = 'all';

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Link paginator and sort to the data source
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data.filter((user) => user.role !== 3); // Exclude admins
        this.applyFilters(); // Apply initial filters
        // this.applyFiltersByRoles();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      },
    });
  }

  // applyFiltersByRoles(): void {
  //   let users = [...this.allUsers];
   
  //   this.dataSource.data = users;
  // }

  applyFilters(): void {
    let users = [...this.allUsers];

    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      users = users.filter((user) => user.isActive === isActive);
    }

     if (this.roleFilter !== 'all') {
      users = users.filter((user) => {
        if (this.roleFilter === 'student') return user.role === 1;
        if (this.roleFilter === 'instructor') return user.role === 2;
        return true;
      });
    }

    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercasedTerm) ||
          user.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    // --- Update the MatTableDataSource ---
    this.dataSource.data = users;

    // Go back to the first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
   
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'Deactivate' : 'Activate';
    
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action} User`,
        message: `Are you sure you want to ${action.toLowerCase()} "${user.name}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const newStatus = !user.isActive;
        this.adminService.updateUserStatus(user.email, newStatus).subscribe({
          next: () => {
            const userInAll = this.allUsers.find((u) => u.email === user.email);
            if (userInAll) userInAll.isActive = newStatus;
            this.applyFilters(); // Re-apply filters to update the view
          },
          error: (err) => console.error('Failed to update user status', err),
        });
      }
    });
  }
}