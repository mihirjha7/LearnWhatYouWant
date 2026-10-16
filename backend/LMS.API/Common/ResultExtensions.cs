using LMS.Infrastructure.Common;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Common
{
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult(this Result result, ControllerBase controller)
        {
            return result.IsSuccess
                ? controller.NoContent()
                : Problem(result.Error!, controller);
        }

        public static IActionResult ToActionResult<TValue>(this Result<TValue> result, ControllerBase controller)
        {
            return result.IsSuccess
                ? controller.Ok(result.Value)
                : Problem(result.Error!, controller);
        }

        private static IActionResult Problem(Error error, ControllerBase controller)
        {
            var statusCode = error.Type switch
            {
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Conflict => StatusCodes.Status409Conflict,
                ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
                ErrorType.Forbidden => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status500InternalServerError
            };

            return controller.Problem(
                detail: error.Message,
                statusCode: statusCode,
                title: error.Code);
        }
    }
}
