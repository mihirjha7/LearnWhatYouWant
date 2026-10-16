using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Updated_Users_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsInstructor",
                table: "users");

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "UserID", "Bio", "Email", "IsActive", "LastLogin", "Name", "PasswordHash", "ProfilePicture", "Role", "UpdatedAt" },
                values: new object[] { 1, null, "admin@cognizant.com", true, null, "Admin", "admin@123", null, 3, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "UserID",
                keyValue: 1);

            migrationBuilder.AddColumn<bool>(
                name: "IsInstructor",
                table: "users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
