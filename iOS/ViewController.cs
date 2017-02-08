using System;
using System.IO;
using Foundation;
using UIKit;

namespace ReproIssues.iOS
{
    public partial class ViewController : UIViewController
    {
        public ViewController(IntPtr handle) : base(handle)
        {
        }

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();

#if ENABLE_TEST_CLOUD
            Xamarin.Calabash.Start ();
#endif

            Navigate("/index.html");
        }

        public void Navigate(string relativeUrl)
        {
            var escapedBundlePath = Uri.EscapeUriString(NSBundle.MainBundle.BundlePath);
            var commandPath = Path.Combine(escapedBundlePath, "www" + relativeUrl);
            var request = new NSUrlRequest(new NSUrl(commandPath));
            this.webView.LoadRequest(request);
        }
    }
}
