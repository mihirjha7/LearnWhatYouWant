
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;


namespace Lms.Data.EntityConfigurations
{
    public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
    {
        public void Configure(EntityTypeBuilder<Enrollment> builder)
        {
            // Configuration goes here
            builder.ToTable("enrollments");

            builder.HasKey(e => e.EnrollmentID);

            builder.Property(e => e.EnrollmentDate)
                   .HasColumnType("datetime2");

            builder.Property(e => e.CompletionStatus)
                   .HasMaxLength(100)
                   .IsUnicode(false);

            builder.Property(e => e.CertificateURL)
                   .HasMaxLength(2048)
                   .IsUnicode(false);

            builder.Property(e => e.UpdatedAt)
                   .HasColumnType("datetime2");

            builder.Property(e => e.IsDeleted)
                   .HasDefaultValue(false);

            builder.HasOne(e => e.Course)
                   .WithMany(c => c.Enrollments)
                   .HasForeignKey(e => e.CourseID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.User)
                   .WithMany(u => u.Enrollments)
                   .HasForeignKey(e => e.UserID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
