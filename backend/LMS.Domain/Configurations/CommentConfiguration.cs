// Fluent API configuration for Comment
using Microsoft.EntityFrameworkCore;
using LMS.Domain.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lms.Data.EntityConfigurations {
    public class CommentConfiguration : IEntityTypeConfiguration<Comment> {
        public void Configure(EntityTypeBuilder<Comment> builder) {
            // Configuration goes here
            builder.ToTable("comments");
            builder.HasKey(x => x.CommentID);
            builder.Property(x => x.CommentID).UseIdentityColumn();
            builder.Property(x => x.Content).IsRequired().HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);

            builder.HasOne(x => x.Course)
                .WithMany(c => c.Comments)
                .HasForeignKey(x => x.CourseID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Parent)
                .WithMany(p => p.Replies)
                .HasForeignKey(x => x.ParentCommentID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.CourseID, x.CreatedAt });
            builder.HasQueryFilter(x => !x.IsDeleted);
        }
    }
}