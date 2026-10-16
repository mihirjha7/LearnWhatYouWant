// Fluent API configuration for Notification
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LMS.Domain.Models;

namespace LMS.Domain.Configurations {
    public class MessageConfiguration : IEntityTypeConfiguration<Message> {
        public void Configure(EntityTypeBuilder<Message> builder) {
            // Configuration goes here

            builder.ToTable("messages");
            builder.HasKey(x => x.MessageID);
            builder.Property(x => x.MessageID).UseIdentityColumn();
            builder.Property(x => x.Content).IsRequired().HasColumnType("varchar(max)").IsUnicode(false);
            builder.Property(x => x.IsRead).HasDefaultValue(false);
            builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.MessageType).HasMaxLength(50).IsUnicode(false);
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);

            builder.HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.SenderID)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverID)
                .OnDelete(DeleteBehavior.Restrict);


            builder.HasIndex(x => new { x.ReceiverID, x.IsRead, x.CreatedAt });
            builder.HasQueryFilter(x => !x.IsDeleted);

        }
    }
}