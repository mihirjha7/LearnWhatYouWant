using LMS.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Domain.Configurations
{
    public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
    {
        public void Configure(EntityTypeBuilder<Quiz> builder)
        {
            builder.ToTable("quizzes");
            builder.HasKey(x => x.QuizID);
            builder.Property(x => x.QuizID)
                .UseIdentityColumn();
            builder.Property(x => x.CourseID)
                .IsRequired();
            builder.Property(x => x.Title)
                .IsRequired();
            builder.Property(x => x.TotalMarks);
            builder.Property(x => x.TimeLimit);
            builder.Property(x => x.AttemptsAllowed);
            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt)
                .HasColumnType("datetime2");
            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.HasOne(x => x.Course)
                .WithMany(c => c.Quizzes)
                .HasForeignKey(x => x.CourseID)
                .OnDelete(DeleteBehavior.Cascade);




        }
    }
}
