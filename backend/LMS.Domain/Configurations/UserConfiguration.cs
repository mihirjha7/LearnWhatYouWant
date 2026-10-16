// Fluent API configuration for User
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace LMS.Domain.Configurations {
    public class UserConfiguration : IEntityTypeConfiguration<User> {
        public void Configure(EntityTypeBuilder<User> builder) {
            // Configuration goes here

            builder.ToTable("users");
            builder.HasKey(x => x.UserID);
            builder.Property(x => x.UserID)
                .UseIdentityColumn();
            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150)
                .IsUnicode(false);
            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(256)
                .IsUnicode(false);
            builder.Property(x => x.PasswordHash)
                .IsRequired()
                .HasMaxLength(512)
                .IsUnicode(false);
            builder.Property(x => x.ProfilePicture)
                .HasMaxLength(2048)
                .IsUnicode(false);
            builder.Property(x => x.Bio)
                .HasColumnType("varchar(max)")
                .IsUnicode(false);
            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);
            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.UpdatedAt)
                .HasColumnType("datetime2");
            builder.Property(x => x.LastLogin)
                .HasColumnType("datetime2");
            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

           
            builder.HasIndex(x => x.Email)
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
            builder.HasQueryFilter(x => !x.IsDeleted);


        }
    }
}