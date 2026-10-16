// Fluent API configuration for Progress
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;



namespace Lms.Domain.Configurations
{
    public class ProgressConfiguration : IEntityTypeConfiguration<Progress>
    {
        public void Configure(EntityTypeBuilder<Progress> builder)
        {
            builder.ToTable("progresses");
            builder.HasKey(x => x.ProgressID);
            builder.Property(x => x.ProgressID).UseIdentityColumn();
            builder.Property(x => x.CompletionPercentage).HasColumnType("float");
            builder.Property(x => x.LastAccessed).HasColumnType("datetime2");
            builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

            builder.HasOne(x => x.User)
                .WithMany(u => u.Progresses)
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Course)
                .WithMany(c => c.Progresses)
                .HasForeignKey(x => x.CourseID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.UserID, x.CourseID }).IsUnique();
        }
    }
}
