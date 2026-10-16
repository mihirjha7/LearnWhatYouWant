using System.Diagnostics.CodeAnalysis;

namespace LMS.Infrastructure.Common
{
    public enum ErrorType
    {
        Validation,
        NotFound,
        Conflict,
        Unauthorized,
        Forbidden,
        Failure
    }

    public sealed record Error(string Code, string Message, ErrorType Type)
    {
        public static Error Validation(string code, string message) => new(code, message, ErrorType.Validation);
        public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);
        public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);
        public static Error Unauthorized(string code, string message) => new(code, message, ErrorType.Unauthorized);
        public static Error Forbidden(string code, string message) => new(code, message, ErrorType.Forbidden);
        public static Error Failure(string code, string message) => new(code, message, ErrorType.Failure);
    }

    public class Result
    {
        protected Result(bool isSuccess, Error? error)
        {
            if (isSuccess && error is not null)
            {
                throw new ArgumentException("A successful result cannot contain an error.", nameof(error));
            }

            if (!isSuccess && error is null)
            {
                throw new ArgumentException("A failed result requires an error.", nameof(error));
            }

            IsSuccess = isSuccess;
            Error = error;
        }

        public bool IsSuccess { get; }

        public bool IsFailure => !IsSuccess;

        public Error? Error { get; }

        public static Result Success() => new(true, null);

        public static Result Failure(Error error) => new(false, error);

        public static Result<TValue> Success<TValue>(TValue value) => Result<TValue>.Success(value);

        public static Result<TValue> Failure<TValue>(Error error) => Result<TValue>.Failure(error);
    }

    public sealed class Result<TValue> : Result
    {
        private readonly TValue? _value;

        private Result(bool isSuccess, TValue? value, Error? error)
            : base(isSuccess, error)
        {
            _value = value;
        }

        public TValue Value => IsSuccess
            ? _value!
            : throw new InvalidOperationException("The value of a failed result cannot be accessed.");

        public static Result<TValue> Success(TValue value) => new(true, value, null);

        public static new Result<TValue> Failure(Error error) => new(false, default, error);

        public bool TryGetValue([NotNullWhen(true)] out TValue? value)
        {
            value = _value;
            return IsSuccess && value is not null;
        }
    }
}
