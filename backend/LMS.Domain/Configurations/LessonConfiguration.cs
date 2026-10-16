// Fluent API configuration for Lesson
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;


namespace Lms.Domain.Configurations
{
    public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
    {
        public void Configure(EntityTypeBuilder<Lesson> builder)
        {
            builder.ToTable("lessons");
            builder.HasKey(x => x.LessonID);
            builder.Property(x => x.LessonID).UseIdentityColumn();
            builder.Property(x => x.Title).IsRequired().HasMaxLength(200).IsUnicode(false);
            builder.Property(x => x.Content).HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.VideoURL).HasMaxLength(2048).IsUnicode(false);
            builder.Property(x => x.LessonType).HasMaxLength(50).IsUnicode(false);
            builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);

            builder.HasOne(x => x.Course)
                .WithMany(c => c.Lessons)
                .HasForeignKey(x => x.CourseID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.CourseID, x.OrderIndex }).HasDatabaseName("IX_Lessons_Course_Order");
            builder.HasQueryFilter(x => !x.IsDeleted);
        }
    }
}
