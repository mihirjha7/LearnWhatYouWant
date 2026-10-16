using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LessonAttachmentFileName",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LessonAttachmentUrl",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CourseMaterialFileName",
                table: "courses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CourseMaterialUrl",
                table: "courses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LessonAttachmentFileName",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "LessonAttachmentUrl",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "CourseMaterialFileName",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "CourseMaterialUrl",
                table: "courses");
        }
    }
}
