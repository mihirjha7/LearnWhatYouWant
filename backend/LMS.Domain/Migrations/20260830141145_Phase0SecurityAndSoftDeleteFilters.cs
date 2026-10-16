using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Phase0SecurityAndSoftDeleteFilters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM [users] WHERE [UserID] = 1 AND [Email] = N'admin@cognizant.com' AND [PasswordHash] = N'admin@123';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
