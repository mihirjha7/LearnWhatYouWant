// Fluent API configuration for Answer
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace LMS.Domain.Configurations {
    public class AnswerConfiguration : IEntityTypeConfiguration<Answer> {
        public void Configure(EntityTypeBuilder<Answer> builder) {
            // Configuration goes here

            builder.ToTable("answers");
            builder.HasKey(x => x.AnswerID);
            builder.Property(x => x.AnswerID).UseIdentityColumn();
            builder.Property(x => x.Response).HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.SubmittedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

            builder.HasOne(x => x.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(x => x.QuestionID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User)
                .WithMany(u => u.Answers)
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.QuestionID, x.UserID, x.SubmittedAt });

        }
    }
}