using System;
using Android.App;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Webkit;

namespace ReproIssues.Droid
{
    [Register("com.test.reproissues.droid.ViewFragment")]
    public class ViewFragment : Fragment
    {
        private WebView _webView;

        public ViewFragment() : base() { }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            var rootView = inflater.Inflate(Resource.Layout.WebView, container, false);

            _webView = rootView.FindViewById<WebView>(Resource.Id.myWebView);
            _webView.Settings.JavaScriptEnabled = true;
            _webView.Settings.AllowUniversalAccessFromFileURLs = true;
#if DEBUG
            WebView.SetWebContentsDebuggingEnabled(true);
#endif

            return rootView;
        }

        public override void OnStart()
        {
            base.OnStart();

            this.Navigate("/index.html");
        }

        public void Navigate(string relativeUrl)
        {
            if (_webView == null) return;

            var root = "file:///android_asset/www";
            var path = root + relativeUrl;
            var uri = new Uri(path);
            _webView.LoadUrl(uri.ToString());
        }
    }
}
