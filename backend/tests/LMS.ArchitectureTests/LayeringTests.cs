using System.Reflection;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace LMS.ArchitectureTests;

public class LayeringTests
{
    private static readonly Assembly ApiAssembly = typeof(LMS.API.Program).Assembly;
    private static readonly Assembly DomainAssembly = typeof(LMS.Domain.LmsDbContext).Assembly;

    private static IEnumerable<Type> Controllers() =>
        ApiAssembly.GetTypes().Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract);

    [Fact]
    public void Domain_DoesNotDependOnAspNetMvc()
    {
        var referenced = DomainAssembly.GetReferencedAssemblies().Select(a => a.Name);

        Assert.DoesNotContain("Microsoft.AspNetCore.Mvc.Core", referenced);
    }

    [Fact]
    public void Controllers_ShouldNotDependOnDbContextDirectly()
    {
        var offenders = Controllers()
            .Where(controller => controller
                .GetConstructors()
                .SelectMany(c => c.GetParameters())
                .Any(p => p.ParameterType == typeof(LMS.Domain.LmsDbContext)))
            .Select(c => c.Name)
            .ToList();

        Assert.True(offenders.Count == 0, $"Controllers must not inject DbContext: {string.Join(", ", offenders)}");
    }

    [Fact]
    public void Controllers_ShouldNotDependOnRepositories()
    {
        var offenders = Controllers()
            .Where(controller => controller
                .GetConstructors()
                .SelectMany(c => c.GetParameters())
                .Any(p => p.ParameterType.Namespace == typeof(IEnrollmentRepository).Namespace))
            .Select(c => c.Name)
            .ToList();

        Assert.True(offenders.Count == 0, $"Controllers must use services: {string.Join(", ", offenders)}");
    }

    [Fact]
    public void Controllers_ShouldBeSuffixedWithController()
    {
        Assert.All(Controllers(), controller => Assert.EndsWith("Controller", controller.Name));
    }

    [Fact]
    public void EndpointsMustDeclareAnExplicitAccessPolicy()
    {
        var offenders = Controllers()
            .SelectMany(c => c.GetMethods(BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance))
            .Where(m => m.GetCustomAttributes<HttpMethodAttribute>(inherit: true).Any())
            .Where(m =>
                !m.GetCustomAttributes<AuthorizeAttribute>(inherit: true).Any() &&
                !m.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true).Any() &&
                !m.DeclaringType!.GetCustomAttributes<AuthorizeAttribute>(inherit: true).Any() &&
                !m.DeclaringType!.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true).Any())
            .Select(m => $"{m.DeclaringType!.Name}.{m.Name}")
            .ToList();

        Assert.True(
            offenders.Count == 0,
            $"Endpoints must declare [Authorize] or [AllowAnonymous]: {string.Join(", ", offenders)}");
    }

    [Fact]
    public void Controllers_ShouldNotReturnDomainEntities()
    {
        var domainNamespace = typeof(LMS.Domain.Models.User).Namespace;

        var offenders = Controllers()
            .SelectMany(c => c.GetMethods(BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance))
            .Where(m =>
            {
                var returnType = m.ReturnType;
                if (returnType.IsGenericType)
                {
                    returnType = returnType.GetGenericArguments()[0];
                }

                return returnType.Namespace == domainNamespace;
            })
            .Select(m => $"{m.DeclaringType!.Name}.{m.Name}")
            .ToList();

        Assert.True(offenders.Count == 0, $"Controllers must not return domain entities: {string.Join(", ", offenders)}");
    }

    [Fact]
    public void ApplicationServices_ShouldNotExposeDomainEntities()
    {
        var domainNamespace = typeof(LMS.Domain.Models.User).Namespace;
        var servicesNamespace = typeof(LMS.Infrastructure.Services.Interfaces.IUserService).Namespace;

        var offenders = typeof(LMS.Infrastructure.Services.Interfaces.IUserService).Assembly
            .GetTypes()
            .Where(t => t.IsInterface && t.Namespace == servicesNamespace)
            .SelectMany(t => t.GetMethods())
            .Where(m =>
            {
                var returnType = m.ReturnType;
                while (returnType.IsGenericType)
                {
                    returnType = returnType.GetGenericArguments()[0];
                }

                return returnType.Namespace == domainNamespace;
            })
            .Select(m => $"{m.DeclaringType!.Name}.{m.Name}")
            .ToList();

        Assert.True(offenders.Count == 0, $"Service contracts must not expose entities: {string.Join(", ", offenders)}");
    }
}
