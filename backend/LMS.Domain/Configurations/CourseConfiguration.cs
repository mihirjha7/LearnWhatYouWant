// Fluent API configuration for Course
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace Lms.Data.EntityConfigurations {
    public class CourseConfiguration : IEntityTypeConfiguration<Course> {
        public void Configure(EntityTypeBuilder<Course> builder) {
            // Configuration goes here
            builder.ToTable("courses");

            builder.HasKey(c => c.CourseID);

            builder.Property(c => c.Title)
                   .IsRequired()
                   .HasMaxLength(200)
                   .IsUnicode(false);

            builder.Property(c => c.Description)
                   .HasColumnType("varchar(max)")
                   .IsUnicode(false);

            builder.Property(c => c.Syllabus)
                   .HasColumnType("varchar(max)")
                   .IsUnicode(false);

            builder.Property(c => c.Level)
                   .HasMaxLength(50)
                   .IsUnicode(false);

            builder.Property(c => c.Language)
                   .HasMaxLength(50)
                   .IsUnicode(false);

            builder.Property(c => c.Duration);

            builder.Property(c => c.ThumbnailURL)
                   .HasMaxLength(2048)
                   .IsUnicode(false);

            builder.Property(c => c.CategoryID);

            builder.Property(c => c.Published)
                   .HasDefaultValue(false);

            builder.Property(c => c.Rating);

            builder.Property(c => c.ReviewCount);


            builder.Property(c => c.CreatedAt)
                   .HasColumnType("datetime2")
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(c => c.UpdatedAt)
                   .HasColumnType("datetime2");

            builder.Property(c => c.IsDeleted)
                   .HasDefaultValue(false);

            builder.HasMany(c => c.Enrollments)
                   .WithOne(e => e.Course)
                   .HasForeignKey(e => e.CourseID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(c => !c.IsDeleted);

        }
    }
}