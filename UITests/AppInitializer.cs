using System;
using System.IO;
using System.Linq;
using Xamarin.UITest;
using Xamarin.UITest.Queries;

namespace ReproIssues.UITests
{
    public static class AppInitializer
    {
        public static IApp StartApp(Platform platform)
        {
            if (platform == Platform.Android)
            {
                return ConfigureApp.Android.StartApp();
            }

            return ConfigureApp.iOS.StartApp();
        }

        public static Platform GetPlatform(this IApp app)
        {
            if (app is Xamarin.UITest.Android.AndroidApp)
            {
                return Platform.Android;
            }
            else
            {
                return Platform.iOS;
            }
        }
    }
}
