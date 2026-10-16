# Runs an end-to-end smoke test against a locally running LMS.API instance.
# Usage: pwsh ./scripts/api-smoke-test.ps1 [-BaseUrl http://127.0.0.1:5111]
[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:5111'
)

$ErrorActionPreference = 'Stop'
$script:Failures = 0

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body,
        [string]$Token
    )

    $headers = @{}
    if ($Token) { $headers['Authorization'] = "Bearer $Token" }

    $params = @{
        Uri             = "$BaseUrl$Path"
        Method          = $Method
        Headers         = $headers
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $params['ContentType'] = 'application/json'
        $params['Body'] = ($Body | ConvertTo-Json -Depth 6)
    }

    try {
        $response = Invoke-WebRequest @params
        return [pscustomobject]@{
            Status  = [int]$response.StatusCode
            Content = $response.Content
        }
    }
    catch {
        $status = 0
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        return [pscustomobject]@{ Status = $status; Content = $_.Exception.Message }
    }
}

function Assert-Status {
    param(
        [string]$Name,
        [int]$Expected,
        $Result
    )

    if ($Result.Status -eq $Expected) {
        Write-Host "PASS  $Name ($($Result.Status))" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL  $Name (expected $Expected, got $($Result.Status))" -ForegroundColor Red
        $script:Failures++
    }
}

Write-Host "Running API smoke tests against $BaseUrl" -ForegroundColor Cyan

Assert-Status 'health' 200 (Invoke-Api GET '/health')
Assert-Status 'categories are public' 200 (Invoke-Api GET '/api/CourseCategories')
Assert-Status 'courses are public' 200 (Invoke-Api GET '/api/Course')

# Authentication
$suffix = [guid]::NewGuid().ToString('N').Substring(0, 8)
$student = @{ Name = "Smoke Student"; Email = "smoke.$suffix@example.com"; Password = 'Str0ng!Passw0rd' }

$register = Invoke-Api POST '/api/Auth/register' $student
Assert-Status 'student registration' 200 $register
$studentToken = ($register.Content | ConvertFrom-Json).accessToken

Assert-Status 'duplicate registration is rejected' 409 (Invoke-Api POST '/api/Auth/register' $student)
Assert-Status 'invalid password is rejected' 401 (Invoke-Api POST '/api/Auth/login' @{ Email = $student.Email; Password = 'WrongPassword1!' })
Assert-Status 'valid login succeeds' 200 (Invoke-Api POST '/api/Auth/login' @{ Email = $student.Email; Password = $student.Password })
Assert-Status 'validation rejects malformed email' 400 (Invoke-Api POST '/api/Auth/login' @{ Email = 'not-an-email'; Password = '' })

# Authorization
Assert-Status 'protected endpoint rejects anonymous callers' 401 (Invoke-Api GET '/api/Enrollment/user/courses')
Assert-Status 'profile requires only authentication' 200 (Invoke-Api GET '/api/UserManagement/me' -Token $studentToken)
Assert-Status 'student can list enrolled courses' 200 (Invoke-Api GET '/api/Enrollment/user/courses' -Token $studentToken)
Assert-Status 'enrollment rejects unknown course' 404 (Invoke-Api POST '/api/Enrollment' @{ CourseId = 999999 } -Token $studentToken)
Assert-Status 'enrollment validates course id' 400 (Invoke-Api POST '/api/Enrollment' @{ CourseId = 0 } -Token $studentToken)
Assert-Status 'student cannot access admin users' 403 (Invoke-Api GET '/api/UserManagement/admin/users' -Token $studentToken)

# Password reset must not leak whether an account exists.
$knownEmail = Invoke-Api POST '/api/Auth/forgotPassword' $student.Email
$unknownEmail = Invoke-Api POST '/api/Auth/forgotPassword' "missing.$suffix@example.com"
Assert-Status 'forgot password (known account)' 200 $knownEmail
Assert-Status 'forgot password (unknown account)' 200 $unknownEmail
Assert-Status 'reset rejects an invalid token' 400 (Invoke-Api POST '/api/Auth/resetPassword' @{ token = 'invalid-token'; password = 'Str0ng!Passw0rd2' })

if ($script:Failures -eq 0) {
    Write-Host "`nAll smoke tests passed." -ForegroundColor Green
    exit 0
}

Write-Host "`n$script:Failures smoke test(s) failed." -ForegroundColor Red
exit 1
