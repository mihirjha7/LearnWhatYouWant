// Fluent API configuration for QuizScore
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace Lms.Data.EntityConfigurations {
    public class QuizScoreConfiguration : IEntityTypeConfiguration<QuizScore> {
        public void Configure(EntityTypeBuilder<QuizScore> builder) {
            // Configuration goes here
            builder.HasKey(qs => qs.ScoreID);
            builder.Property(qs => qs.ScoreID).ValueGeneratedOnAdd();
            builder.Property(qs => qs.Score).IsRequired();
            builder.Property(qs => qs.AttemptNumber).IsRequired();
            builder.Property(qs => qs.CreatedAt).HasDefaultValueSql("GETDATE()").IsRequired();
            builder.Property(qs => qs.UpdatedAt).IsRequired(false);

            // Relationships
            builder.HasOne(qs => qs.User)
                   .WithMany(u => u.QuizScores)
                   .HasForeignKey(qs => qs.UserID)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(qs => qs.Quiz)
                     .WithMany(q => q.QuizScores)
                     .HasForeignKey(qs => qs.QuizID)
                     .OnDelete(DeleteBehavior.Cascade);

        }
    }
}