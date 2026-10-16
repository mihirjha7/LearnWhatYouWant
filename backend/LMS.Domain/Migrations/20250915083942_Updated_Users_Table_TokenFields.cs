using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Updated_Users_Table_TokenFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResetToken",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetTokenExpiry",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: 1,
                columns: new[] { "ResetToken", "ResetTokenExpiry" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetToken",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ResetTokenExpiry",
                table: "users");
        }
    }
}
