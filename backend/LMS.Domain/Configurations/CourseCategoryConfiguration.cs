// Fluent API configuration for Category
using Microsoft.EntityFrameworkCore;
using LMS.Domain.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Domain.Configurations {
    public class CourseCategoryConfiguration : IEntityTypeConfiguration<CourseCategory> {
        public void Configure(EntityTypeBuilder<CourseCategory> builder) {
            // Configuration goes here
            builder.ToTable("categories");
            builder.HasKey(x => x.CategoryID);
            builder.Property(x => x.CategoryID).UseIdentityColumn();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(150).IsUnicode(false);
            builder.Property(x => x.Description).HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);

            builder.HasIndex(x => x.Name).IsUnique().HasFilter("[IsDeleted] = 0");
            builder.HasQueryFilter(x => !x.IsDeleted);
        }
    }
}