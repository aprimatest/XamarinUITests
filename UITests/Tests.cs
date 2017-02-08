using System;
using NUnit.Framework;
using Xamarin.UITest;
using Xamarin.UITest.Queries;

namespace ReproIssues.UITests
{
    [TestFixture(Platform.Android)]
    [TestFixture(Platform.iOS)]
    public class Tests
    {
        IApp app;
        Platform platform;

        Func<AppQuery, AppWebQuery> landingHeader = x => x.WebView().Css("#landingHeader");
        Func<AppQuery, AppWebQuery> pinchToZoomNav = x => x.WebView().Css("#pinchtozoom_nav");

        public Tests(Platform platform)
        {
            this.platform = platform;
        }

        [SetUp]
        public void BeforeEachTest()
        {
            app = AppInitializer.StartApp(platform);
            app.WaitForElement(landingHeader, "Timed out waiting for app to load", TimeSpan.FromSeconds(20));
            app.Screenshot("App loaded");
        }

        [Test]
        public void PinchToZoomShouldZoom()
        {
            app.Tap(pinchToZoomNav);

            var page = new PinchToZoomPage(app);
            page.WaitUntilLoaded();

            var scale = page.GetImageScale(0);
            Assert.AreEqual(1.0, scale.Height);
            Assert.AreEqual(1.0, scale.Width);

            page.ZoomInOnImage(0);

            var scale2 = page.GetImageScale(0);
            Assert.Less(1.0, scale2.Height);
            Assert.Less(1.0, scale2.Width);
        }
    }
}
