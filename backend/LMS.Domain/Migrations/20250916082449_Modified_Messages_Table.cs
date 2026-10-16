using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Modified_Messages_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_messages_users_UserID",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_UserID_IsRead_CreatedAt",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "TargetURL",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "messages",
                newName: "Content");

            migrationBuilder.AlterColumn<int>(
                name: "UserID",
                table: "messages",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ReceiverID",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SenderID",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_messages_ReceiverID_IsRead_CreatedAt",
                table: "messages",
                columns: new[] { "ReceiverID", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_messages_SenderID",
                table: "messages",
                column: "SenderID");

            migrationBuilder.CreateIndex(
                name: "IX_messages_UserID",
                table: "messages",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_messages_users_ReceiverID",
                table: "messages",
                column: "ReceiverID",
                principalTable: "users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_messages_users_SenderID",
                table: "messages",
                column: "SenderID",
                principalTable: "users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_messages_users_UserID",
                table: "messages",
                column: "UserID",
                principalTable: "users",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_messages_users_ReceiverID",
                table: "messages");

            migrationBuilder.DropForeignKey(
                name: "FK_messages_users_SenderID",
                table: "messages");

            migrationBuilder.DropForeignKey(
                name: "FK_messages_users_UserID",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_ReceiverID_IsRead_CreatedAt",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_SenderID",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_UserID",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "ReceiverID",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "SenderID",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "messages",
                newName: "Message");

            migrationBuilder.AlterColumn<int>(
                name: "UserID",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetURL",
                table: "messages",
                type: "varchar(2048)",
                unicode: false,
                maxLength: 2048,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_messages_UserID_IsRead_CreatedAt",
                table: "messages",
                columns: new[] { "UserID", "IsRead", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_messages_users_UserID",
                table: "messages",
                column: "UserID",
                principalTable: "users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
