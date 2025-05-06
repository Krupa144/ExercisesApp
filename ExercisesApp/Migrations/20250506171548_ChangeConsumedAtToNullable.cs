using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExercisesApp.Migrations
{
    /// <inheritdoc />
    public partial class ChangeConsumedAtToNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Foods_AspNetUsers_UserId",
                table: "Foods");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_Foods_AspNetUsers_UserId",
                table: "Foods",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
