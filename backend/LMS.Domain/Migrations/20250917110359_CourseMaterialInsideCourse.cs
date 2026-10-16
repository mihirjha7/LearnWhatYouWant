using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class CourseMaterialInsideCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CourseMaterial",
                table: "CourseInstructors",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CourseMaterial",
                table: "CourseInstructors");
        }
    }
}
