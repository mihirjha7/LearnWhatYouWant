// Fluent API configuration for Question
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace LMS.Domain.Configurations {
    public class QuestionConfiguration : IEntityTypeConfiguration<Question> {
        public void Configure(EntityTypeBuilder<Question> builder) {
            // Configuration goes here

            builder.ToTable("questions");
            builder.HasKey(x => x.QuestionID);
            builder.Property(x => x.QuestionID).UseIdentityColumn();
            builder.Property(x => x.QuestionText).IsRequired().HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.QuestionType).HasMaxLength(50).IsUnicode(false);
            builder.Property(x => x.Options).HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.CorrectAnswer).HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.Marks);
            builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);

            builder.HasOne(x => x.Quiz)
                .WithMany(q => q.Questions)
                .HasForeignKey(x => x.QuizID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasQueryFilter(x => !x.IsDeleted);

        }
    }
}